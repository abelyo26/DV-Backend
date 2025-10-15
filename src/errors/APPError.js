/**
 * @augments Error
 */

/**
 * AppError class
 */
class AppError extends Error {
  /**
   * AppError constructor
   * @param {string} message - The error message
   * @param {number} status - The error status
   * @param {boolean} isPublic - The error is public
   */
  constructor(message, status, isPublic) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.isPublic = isPublic;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor.name);
  }
}

export default AppError;
