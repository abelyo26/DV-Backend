import { body, param, query } from 'express-validator';

import { paymentMethods } from '../utils/constants';

export const postApplicationValidator = [
  // Applicant Info
  body('applicant.firstName').notEmpty().withMessage('First name is required'),
  body('applicant.lastName').notEmpty().withMessage('Last name is required'),
  body('applicant.gender')
    .isIn(['Male', 'Female'])
    .withMessage('Invalid gender'),
  body('applicant.dateOfBirth')
    .isISO8601()
    .withMessage('Date of birth is required'),
  body('applicant.countryOfBirth')
    .notEmpty()
    .withMessage('Country of birth is required'),
  body('applicant.countryOfEligibility')
    .notEmpty()
    .withMessage('Country of eligibility is required'),
  body('applicant.email').isEmail().withMessage('Valid email is required'),
  body('applicant.phone').isString().withMessage('Invalid phone number'),
  body('applicant.photoUrl')
    .notEmpty()
    .isString()
    .withMessage('Photo URL is required'),

  // Education
  body('applicant.education.level')
    .optional()
    .isIn([
      'Primary School only',
      'High School, no degree',
      'High School degree',
      'Vocational School',
      'Some University Courses',
      'University Degree',
      'Some Graduate Level Courses',
      "Master's Degree",
      'Some Doctorate Level Courses',
      'Doctorate Degree',
    ])
    .withMessage('Invalid education level'),

  // Marital Status
  body('applicant.maritalStatus')
    .isIn(['Single', 'Married', 'Divorced', 'Widowed', 'Legally Separated'])
    .withMessage('Invalid marital status'),

  // Dependents (array)
  body('dependents.*.firstName')
    .optional()
    .notEmpty()
    .withMessage('Dependent first name is required'),
  body('dependents.*.lastName')
    .optional()
    .notEmpty()
    .withMessage('Dependent last name is required'),
  body('dependents.*.dob')
    .optional()
    .isISO8601()
    .withMessage('Dependent DOB must be a valid date'),
  body('dependents.*.relationship')
    .optional()
    .isIn(['Spouse', 'Child'])
    .withMessage('Invalid dependent relationship'),
  body('dependents.*.photoUrl')
    .optional()
    .isString()
    .withMessage('Dependent photo URL must be valid'),

  // Payment
  body('payment.status')
    .optional()
    .isIn(['pending', 'paid', 'failed'])
    .withMessage('Invalid payment status'),
  body('payment.transactionRef')
    .isString()
    .withMessage('Transaction reference must be a string'),
  body('payment.paymentMethod')
    .isIn(paymentMethods)
    .withMessage(`Invalid payment method '${paymentMethods.join(', ')}'`),

  // Coupon
  body('couponCode')
    .optional()
    .isString()
    .withMessage('Coupon code must be a string'),
];

export const idValidator = [
  param('id').isMongoId().withMessage('Invalid application ID'),
];

export const updateApplicationValidator = [
  ...idValidator,
  ...postApplicationValidator,
];

export const searchApplicationValidator = [
  query('transactionReference')
    .optional()
    .isString()
    .withMessage('Invalid transaction reference'),
  query('phoneNumber')
    .optional()
    .isString()
    .withMessage('Invalid phone number'),
];
