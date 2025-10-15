import { query } from 'express-validator';

export const paginationValidator = [
  query('pageSize')
    .isNumeric()
    .optional()
    .withMessage('pageSize should be a number')
    .isInt({ min: 1 })
    .withMessage('pageSize should be greater than 0')
    .default(10)
    .toInt(),
  query('current')
    .isNumeric()
    .optional()
    .withMessage('current should be a number')
    .isInt({ min: 1 })
    .withMessage('current should be greater than 0')
    .default(1)
    .toInt(),
];
