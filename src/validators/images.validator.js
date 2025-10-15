import { query } from 'express-validator';

/**
 *
 */
const deleteUploadFileValidator = [
  query('filename')
    .isString()
    .isLength({ min: 1 })
    .withMessage('invalid file name'),
];

export { deleteUploadFileValidator };
