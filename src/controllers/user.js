import httpStatus from 'http-status';
import passport from 'passport';

import APIError from '../errors/APIError';
import User from '../models/users';
import { asyncHandler } from '../utils';

export const createUserController = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, password, email } = req.body;

  const newUser = new User({
    email,
    emailVerified: true,
    firstName,
    lastName,
    password,
  });

  try {
    const addedUser = await newUser.createUser();
    res.json(addedUser);
  } catch (error) {
    next(error);
  }
});

export const loginController = (req, res, next) => {
  passport.authenticate('local', (error, user, message) => {
    if (error || !user) {
      return next(error || message);
    }
    const { iat, exp } = JSON.parse(
      Buffer.from(user.token.split('.')[1], 'base64'),
    );
    const maxAge = (exp - iat) * 1000;
    const development = process.env.NODE_ENV === 'development';
    res.cookie('token', user.token, {
      httpOnly: true,
      secure: !development,
      sameSite: 'Strict',
      maxAge,
    });
    res.cookie('access-token', user.accessToken, {
      sameSite: 'Strict',
      maxAge,
    });

    // Create a response object without token fields
    const { token, accessToken, ...userResponse } = user;
    return res.json(userResponse);
  })(req, res, next);
};

export const logoutController = (req, res, next) => {
  res.clearCookie('token');
  res.clearCookie('access-token');
  res.end();
};

export const getTokenOwner = (req, res, next) => {
  // Secure routes middleware will automatically add user object to req.user
  if (req.user) {
    return res.json(req.user);
  }

  const userNotFound = new APIError(
    'User not found',
    httpStatus.NOT_FOUND,
    true,
  );
  return next(userNotFound);
};

export const activateAccount = asyncHandler(async (req, res) => {
  const { token, email } = req.body;
  const verifiedUser = await User.validateActivationToken(token, email);
  res.json(verifiedUser);
});

export const getSupportUserList = asyncHandler(async (req, res) => {
  const { user } = req;
  const supportUser = await User.getSupportUserList(user);
  res.json(supportUser);
});
