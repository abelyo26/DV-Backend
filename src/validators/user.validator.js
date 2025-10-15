import { body, query } from 'express-validator';

import { strongPasswordRegex } from '../utils/constants';

/**
 * Validate user creation
 * @returns {Array} - array of validation rules
 */
const createUserValidator = () => [
  body('firstName').isString().withMessage('First name is required'),
  body('lastName').isString().optional(),
  body('email').isEmail().withMessage('A valid email is required'),
  body('password')
    .isString()

    .isLength({ min: 8, max: 60 })
    .withMessage(
      'Password should be at least 8 cahracters and not greater than 60',
    )
    .withMessage((val) => strongPasswordRegex.test(val))
    .withMessage(
      'Password should contain a lower case letter, an upper case letter, a number and one of these symbols (!@#$%^&*).',
    ),
];

/**
 * Validate user login
 * @returns {Array} - array of validation rules
 */
const loginValidator = () => [
  body('email').isEmail().withMessage('Email is required to login'),
  body('password').isString().withMessage('password is required'),
];

/**
 * Validate email and token
 * @returns {Array} - array of validation rules
 */
const validateEmailValidator = () => [
  query('email').isEmail().withMessage('Email is required'),
  query('token').isString().withMessage('validation token is required'),
];

/**
 * Validate email and token
 * @returns {Array} - array of validation rules
 */
const validateAccountActivate = () => [
  body('email').isEmail().withMessage('Email is required'),
  body('token').isString().withMessage('validation token is required'),
];

export {
  createUserValidator,
  loginValidator,
  validateEmailValidator,
  validateAccountActivate,
};
