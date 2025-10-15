import winston from 'winston';

const fileOptions = {
  maxSize: 2e6,
};

const winstonLogger = winston.createLogger({
  format: winston.format.json(),
  level: 'info',
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      ...fileOptions,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      ...fileOptions,
    }),
  ],
});

export default winstonLogger;
