import { BAD_REQUEST, OK, CONFLICT, CREATED, NOT_FOUND } from 'http-status';
import Coupon from '../models/coupons';
import APIError from '../errors/APIError';
import { asyncHandler } from '../utils';

/**
 * Validate a coupon code
 * @public
 */
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(BAD_REQUEST).json({
      success: false,
      message: 'Coupon code is required',
    });
  }

  const validationResult = await Coupon.validateCoupon(code);

  if (validationResult.isValid) {
    return res.status(OK).json({
      success: true,
      data: validationResult.coupon,
    });
  } else {
    return res.status(BAD_REQUEST).json({
      success: false,
      message: validationResult.message || 'Invalid coupon',
    });
  }
});

/**
 * Create a new coupon
 * @public
 */
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountAmount,
    maxUses,
    startDate,
    endDate,
    isActive,
  } = req.body;

  // Check if coupon with this code already exists
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    throw new APIError({
      message: 'Coupon with this code already exists',
      status: CONFLICT,
    });
  }

  const coupon = new Coupon({
    code: code.toUpperCase(),
    description,
    discountType,
    discountAmount,
    maxUses,
    startDate,
    endDate,
    isActive,
  });

  const savedCoupon = await coupon.save();

  res.status(CREATED).json({
    success: true,
    data: savedCoupon,
  });
});

/**
 * Get all coupons
 * @public
 */
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find();

  res.status(OK).json({
    success: true,
    data: coupons,
  });
});

/**
 * Get coupon by ID
 * @public
 */
export const getCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new APIError({
      message: 'Coupon not found',
      status: NOT_FOUND,
    });
  }

  res.status(OK).json({
    success: true,
    data: coupon,
  });
});

/**
 * Update coupon
 * @public
 */
export const updateCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new APIError({
      message: 'Coupon not found',
      status: NOT_FOUND,
    });
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, req.body, {
    new: true,
  });

  res.status(OK).json({
    success: true,
    data: updatedCoupon,
  });
});

/**
 * Delete coupon
 * @public
 */
export const deleteCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new APIError({
      message: 'Coupon not found',
      status: NOT_FOUND,
    });
  }

  await Coupon.findByIdAndDelete(couponId);

  res.status(OK).json({
    success: true,
    message: 'Coupon deleted successfully',
  });
});
