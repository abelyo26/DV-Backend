import mongoose from 'mongoose';

import * as methodFunctions from './methods';
import couponSchema from './schema';
import * as staticFunctions from './statics';

import { modelNames } from '../../utils/constants';

couponSchema.static(staticFunctions);
couponSchema.method(methodFunctions);

/**
 * @typedef Coupon
 */
const Coupon = mongoose.model(modelNames.coupon, couponSchema);

export default Coupon;
