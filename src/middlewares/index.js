import fs from 'fs';
import path from 'path';

import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import passport from 'passport';

import { jwtKey } from '../config/environments';
import APIError from '../errors/APIError';
import { COOKIE_AUTH_TOKEN } from '../utils/constants';

/**
 *
 * @param req
 * @param res
 * @param next
 */
export const authenticateJwt = (req, res, next) => {
  const affCollectToken = req.cookies[COOKIE_AUTH_TOKEN];

  if (affCollectToken) {
    try {
      const decoded = jwt.verify(affCollectToken, jwtKey);
      req.user = decoded;
      return next();
    } catch (e) {
      return next(new APIError('Unauthorized', httpStatus.UNAUTHORIZED));
    }
  }

  return passport.authenticate(
    'jwt',
    { session: false },
    (error, user, message) => {
      if (error || !user) {
        const _error =
          error instanceof APIError
            ? error
            : new APIError(message, httpStatus.UNAUTHORIZED);
        return next(_error);
      }

      req.user = user.clean();
      return next();
    },
  )(req, res, next);
};

/**
 *
 */
export const getMulterFileUpload = () => {
  const uploadPath = path.resolve(__dirname, '../../uploads');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    /**
     *
     * @param req
     * @param file
     * @param cb
     */
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    /**
     *
     * @param req
     * @param file
     * @param cb
     */
    filename: (req, file, cb) => {
      // Generate unique filename with timestamp and original extension
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
      cb(null, fileName);
    },
  });

  // File filter to validate file types
  /**
   *
   * @param req
   * @param file
   * @param cb
   */
  const fileFilter = (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  };

  const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB
    fileFilter,
  });

  // Wrap multer's single file upload to handle errors
  return (req, res, next) => {
    const fileUpload = upload.single('file');

    fileUpload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
              message: 'File is too large. Maximum file size is 10MB.',
            });
          }
          return res.status(400).json({ message: err.message });
        }
        // An unknown error occurred
        return res.status(500).json({ message: err.message });
      }
      // All is well, proceed to next middleware
      next();
    });
  };
};

/**
 *
 * @param req
 * @param res
 * @param next
 */
export const verifyToken = (req, res, next) => {
  const token = req.cookies[COOKIE_AUTH_TOKEN];

  const missingTokenError = new APIError(
    'Provide credential',
    httpStatus.UNAUTHORIZED,
  );

  if (!token) next(missingTokenError);

  jwt.verify(token, jwtKey, (err, decoded) => {
    if (err) {
      return next(missingTokenError);
    }
    next();
  });
};
