import bodyParser from 'body-parser';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import httpStatus from 'http-status';
import morgan from 'morgan';

import * as environments from './environments';
import winstonLogger from './winston';

import APIError from '../errors/APIError';
import routes from '../routes/index.routes';

const app = express();

// Uncomment next block and comment the line after to log only on dev environment
// if(environments.nodeEnv==='development'){
//   app.use(morgan('dev'));
// }

app.use(morgan('dev'));

winstonLogger.stream = {
  /**
   * Write logs to winston logger
   * @param {string} message - Log message
   */
  write: (message) => {
    winstonLogger.info(message);
  },
};

if (environments.nodeEnv !== 'test') {
  app.use(morgan('combined', { stream: winstonLogger.stream }));
}
const allowedOriginRegex =
  /localhost|127.0.0.1|0.0.0.0|linkaddis.com|91.99.168.216/i;
const corsOptions = {
  /**
   *
   * @param origin
   * @param callback
   */
  origin: (origin, callback) => {
    const isAllowedOrigin = !origin || allowedOriginRegex.test(origin);
    if (isAllowedOrigin) callback(null, true);
    else callback(new Error(`Not allowed by CORS ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  exposedHeaders: ['Content-Range'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compress());
app.use(cookieParser());

app.use('/files', cors(corsOptions), express.static('uploads'));

// Secure middlewares
app.use(helmet());

// Rate limiting middleware - general API limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: 'draft-7', // Set standard headers - X-RateLimit-Limit etc.
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  message: {
    message: 'Too many requests, please try again later.',
    status: httpStatus.TOO_MANY_REQUESTS,
  },
});

// Apply the rate limiting middleware to API routes
app.use('/api', apiLimiter, routes);

// 404 - endpoint not found
app.use((req, res, next) => {
  const notFoundError = new APIError(
    'Endpoint not found',
    httpStatus.NOT_FOUND,
    true,
  );
  return next(notFoundError);
});

// Catch errors passed from controllers
app.use((err, req, res, next) => {
  // Change error catched to APIError if instance is not APIError
  if (!(err instanceof APIError)) {
    const newError = new APIError(
      err.message || 'An unknown error occured',
      httpStatus.INTERNAL_SERVER_ERROR,
    );

    return next(newError);
  }

  return next(err);
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.status === httpStatus.INTERNAL_SERVER_ERROR) {
    console.error(err);
  }

  res.status(err.status).send({
    message: err.isPublic ? err.message : httpStatus[err.status],
    stack: environments.nodeEnv === 'development' ? err.stack : null,
  });
});

export default app;
