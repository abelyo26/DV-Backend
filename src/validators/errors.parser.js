import { validationResult } from 'express-validator';
import httpStatus from 'http-status';

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

  return res.status(httpStatus.BAD_REQUEST).json(validationErrors);
};

export default parser;
