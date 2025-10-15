import dotenv from 'dotenv';
import Joi from 'joi';

// Initiate dotenv to interact with .env file values
dotenv.config();

// Environment variables validation schema
const envSchema = Joi.object({
  APP_DOMAIN: Joi.string().required(),
  APP_EMAIL_ADDRESS: Joi.string().email().required(),
  APP_EMAIL_PASSWORD: Joi.string().required(),
  APP_NAME: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  JWT_KEY: Joi.string().required(),
  MONGO_URL: Joi.string().required().description('MongoDb connection URL'),
  NODE_ENV: Joi.string()
    .allow('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().default(5000),
  RECEIVER_NAME: Joi.string().required(),
  CBE_ACCOUNT_END: Joi.string().required(),
  ABYSSINIA_ACCOUNT_END: Joi.string().required(),
  CBE_ACCOUNT_EXTENSION: Joi.string().required(),
})
  .unknown()
  .required();

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Env vars validation error: ${error.message}`);
}

export const nodeEnv = value.NODE_ENV;
export const port = value.PORT;
export const mongoUrl = value.MONGO_URL;
export const jwtKey = value.JWT_KEY;
export const appEmailAddress = value.APP_EMAIL_ADDRESS;
export const appEmailPassword = value.APP_EMAIL_PASSWORD;
export const appDomain = value.APP_DOMAIN;
export const kafkaBrokerUrl = value.KAFKA_BROKER_URL;
export const appName = value.APP_NAME;
export const receiverName = value.RECEIVER_NAME;
export const cbeAccountEnd = value.CBE_ACCOUNT_END;
export const abyssiniaAccountEnd = value.ABYSSINIA_ACCOUNT_END;
export const cbeAccountExtension = value.CBE_ACCOUNT_EXTENSION;
