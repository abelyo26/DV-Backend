import express from 'express';

import * as controller from '../controllers/coupons';
import { authenticateJwt } from '../middlewares';
import {
  createCouponValidation,
  updateCouponValidation,
  validateCouponValidation,
} from '../validators/coupon.validator';

const router = express.Router();

router
  .route('/')
  .get(authenticateJwt, controller.getCoupons)
  .post(authenticateJwt, createCouponValidation, controller.createCoupon);

router
  .route('/validate')
  .post(validateCouponValidation, controller.validateCoupon);

router
  .route('/:couponId')
  .get(authenticateJwt, controller.getCoupon)
  .put(authenticateJwt, updateCouponValidation, controller.updateCoupon)
  .delete(authenticateJwt, controller.deleteCoupon);

export default router;
