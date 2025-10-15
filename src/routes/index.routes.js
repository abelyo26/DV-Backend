import express from 'express';

import applicationsRoute from './application';
import couponRoutes from './coupon';
import imageRoutes from './images';
import testRoute from './test';
import userRoutes from './user';

import { authenticateJwt } from '../middlewares';

const router = express.Router();

router.use('/test', testRoute);
router.use('/user', userRoutes);
router.use('/images', imageRoutes);
router.use('/applications', applicationsRoute);
router.use('/coupons', couponRoutes);

export default router;
