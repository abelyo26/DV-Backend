import mongoose from 'mongoose';

import * as methodFunctions from './methods';
import userSchema from './schema';
import * as staticFunctions from './statics';

import { modelNames } from '../../utils/constants';

userSchema.static(staticFunctions);
userSchema.method(methodFunctions);

const User = mongoose.model(modelNames.user, userSchema);

export default User;
