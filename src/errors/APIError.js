import httpStatus from 'http-status';

import AppError from './APPError';
/**
 * @augments AppError
 */
class APIError extends AppError {
  /**
   * APIError constructor
   * @param {string} message - The error message
   * @param {number} status - The error status
   * @param {boolean} isPublic - The error is public
   */
  constructor(
    message,
    status = httpStatus.INTERNAL_SERVER_ERROR,
    isPublic = false,
  ) {
    super(message, status, isPublic);
  }
}

export default APIError;
