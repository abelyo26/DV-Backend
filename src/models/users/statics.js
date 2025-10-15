import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';

import APIError from '../../errors/APIError';
import { generateJwtToken } from '../../utils';

/**
 * authenticateUser - Authenticate user with email and password
 * @param {string} email - Email of the user
 * @param {string} password - Password of the user
 * @returns {Promise<*>} - User object with token
 */
export async function authenticateUser(email, password) {
  const user = await this.findOne({ email }).exec();
  const doesntMatchError = new APIError(
    "Email or Password doesn't match",
    httpStatus.UNAUTHORIZED,
    true,
  );
  if (!user) {
    throw doesntMatchError;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (passwordMatch) {
    const { token, accessToken } = generateJwtToken(user._id);
    const cleanUser = user.clean();
    cleanUser.token = token;
    cleanUser.accessToken = accessToken;
    return cleanUser;
  }

  // If not match
  throw doesntMatchError;
}

/**
 * validateActivationToken - Validate user activation token
 * @param {string} token - Activation token
 * @param {string} email - Email of the user
 * @returns {Promise<*>} - User object
 */
export async function validateActivationToken(token, email) {
  const tokenOwner = await this.findOne({ email }).exec();
  if (!tokenOwner) {
    throw new APIError('Not found', httpStatus.NOT_FOUND);
  }

  try {
    const decoded = jwt.verify(token, tokenOwner.password);
    if (decoded._id === `${tokenOwner._id}`) {
      tokenOwner.emailVerified = true;
      await tokenOwner.save();
      return tokenOwner.clean();
    }

    throw new APIError('Unauthorized', httpStatus.UNAUTHORIZED);
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    throw new APIError('Unauthorized', httpStatus.UNAUTHORIZED);
  }
}

export async function getSupportUserList() {
  const supports = await this.find({}, { password: 0 });
  return supports;
}
