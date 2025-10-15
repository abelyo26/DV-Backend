import httpStatus from 'http-status';
import Applications from '../models/applications';
import Coupon from '../models/coupons';
import APIError from '../errors/APIError';
import { sendNewApplicationNotification } from '../config/nodemailer';
import { asyncHandler, verifyPayment } from '../utils';
import winstonLogger from '../config/winston';

export const createApplication = asyncHandler(async (req, res) => {
  const { applicant, dependents, payment, status, couponCode } = req.body;
  let validCoupon = false;
  let amount = 500;

  const existingApplication = await Applications.findOne({
    'payment.transactionRef': payment.transactionRef,
  });

  if (existingApplication) {
    throw new APIError(
      'Application with this transaction reference already exists',
      httpStatus.BAD_REQUEST,
      true,
    );
  }
  if (couponCode) {
    const checkedCoupon = await Coupon.validateCoupon(couponCode);
    if (checkedCoupon.isValid) {
      validCoupon = checkedCoupon;
      amount = amount - checkedCoupon.coupon.discountAmount;
    }
  }

  const newApplication = new Applications({
    applicant,
    dependents,
    payment: {
      ...payment,
      amount,
    },
    status,
    ...(couponCode && validCoupon.isValid
      ? { coupon: validCoupon.coupon._id }
      : {}),
  });
  try {
    const paymentVerified = await verifyPayment({
      transactionId: payment.transactionRef,
      amount,
      method: payment.paymentMethod,
    });
    newApplication.payment.status = paymentVerified ? 'verified' : 'pending';
  } catch (error) {
    winstonLogger.error('Error verifying payment:', error);
    throw error;
  }

  const savedApplication = await newApplication.save();

  await Coupon.updateOne(
    { _id: savedApplication.coupon },
    { $inc: { usedCount: 1 } },
  );

  // Send notification email for new application
  try {
    await sendNewApplicationNotification(savedApplication);
  } catch (notificationError) {
    winstonLogger.error(
      `Failed to send new application notification: ${notificationError}`,
    );
    // Don't throw error here, just log it - we want the API to succeed regardless
  }

  res.status(httpStatus.CREATED).json({
    success: true,
    application: savedApplication,
  });
});
export const getApplications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filters
  const filters = {};

  if (req.query.status) {
    filters.status = req.query.status;
  }
  if (req.query.search) {
    filters['applicant.firstName'] = {
      $regex: req.query.search,
      $options: 'i',
    };
  }
  const applications = await Applications.find(filters)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  // Count for pagination
  const total = await Applications.countDocuments(filters);

  res.status(200).json({
    applications,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
    filters,
  });
});

export const getApplicationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const application = await Applications.findById(id);
  res.status(200).json({ application: application });
});

export const updateApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updatedApplication = await Applications.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true },
  );

  if (!updatedApplication) {
    res.status(httpStatus.NOT_FOUND);
    throw new Error('Application not found');
  }

  res.status(200).json({
    message: `Application ${id} updated successfully`,
    application: updatedApplication,
  });
});

export const deleteApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Applications.findByIdAndDelete(id);
  res.status(200).json({ message: `Application ${id} deleted successfully` });
});

export const searchApplication = asyncHandler(async (req, res) => {
  const { transactionReference, phoneNumber } = req.query;
  const application = await Applications.findOne({
    ...(transactionReference && {
      'payment.transactionRef': transactionReference.trim(),
    }),
    ...(phoneNumber && { 'applicant.phone': phoneNumber.trim() }),
  });
  if (!application) {
    throw new APIError(
      'Application with this transaction reference or phone number not found!',
      httpStatus.NOT_FOUND,
      true,
    );
  }
  res.status(200).json({ application: application });
});

export const verifyApplicationPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const application = await Applications.findByIdAndUpdate(
    id,
    { 'payment.status': 'verified' },
    { new: true },
  );
  res.status(200).json({
    message: `Application ${id} verified successfully`,
    application: application,
  });
});
