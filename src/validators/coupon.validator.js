import { body, param, validationResult } from 'express-validator';

/**
 * Validate request and return errors if any
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

export const createCouponValidation = [
  body('code').notEmpty().withMessage('Coupon code is required'),

  body('description').optional(),

  body('discountAmount')
    .notEmpty()
    .withMessage('Discount amount is required')
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a positive number'),

  body('maxUses')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Max uses must be a positive integer')
    .toInt()
    .custom((value, { req }) => {
      if (value === 0) {
        req.body.maxUses = null; // Convert 0 to null for unlimited uses
      }
      return true;
    }),

  body('startDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .toDate(),

  body('endDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('End date must be a valid date')
    .toDate(),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),

  validateRequest,
];

export const updateCouponValidation = [
  param('couponId').isMongoId().withMessage('Invalid coupon ID format'),

  body('code').optional(),

  body('description').optional(),

  body('discountType')
    .optional()
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be either percentage or fixed'),

  body('discountAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a positive number'),

  body('maxUses')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Max uses must be a positive integer')
    .toInt()
    .custom((value, { req }) => {
      if (value === 0) {
        req.body.maxUses = null; // Convert 0 to null for unlimited uses
      }
      return true;
    }),

  body('startDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .toDate(),

  body('endDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('End date must be a valid date')
    .toDate(),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),

  body('usedCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Used count must be a positive integer')
    .toInt(),

  validateRequest,
];

export const validateCouponValidation = [
  body('code').notEmpty().withMessage('Coupon code is required'),

  validateRequest,
];
