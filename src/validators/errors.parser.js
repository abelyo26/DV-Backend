import { validationResult } from 'express-validator';
import httpStatus from 'http-status';

import APIError from '../errors/APIError';

/**
 * Parse errors from express-validator
 * @param {object} req Request object
 * @param {object} res Response object
 * @param {Function} next Next function
 * @returns {*} Next function or response
 */
const parser = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (validationErrors.isEmpty()) {
    return next();
  }

  next(
    new APIError(validationErrors.array()[0].msg, httpStatus.BAD_REQUEST, true),
  );
};

export default parser;
