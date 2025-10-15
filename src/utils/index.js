import crypto from 'crypto';
import https from 'https';
import { PassThrough } from 'stream';

import axios from 'axios';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import PDFParser from 'pdf2json';

import { paymentMethodsMap } from './constants';

import { appDomain, cbeAccountExtension, jwtKey } from '../config/environments';
import {
  abyssiniaAccountEnd,
  cbeAccountEnd,
  receiverName,
} from '../config/environments';
import winstonLogger from '../config/winston';
import APIError from '../errors/APIError';

/**
 * Generate hashed password
 * @param {string} cleanPassword password to be hashed
 * @returns {Promise<string>} hashed password
 */
const generateHashedPassword = async (cleanPassword) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(cleanPassword, salt);
  return hashedPassword;
};

/**
 * Generates a JWT token and an access token for a given user ID.
 * @param {string} userId - The unique identifier of the user.
 * @param {string} [expiresIn] - Optional expiration time for the tokens.
 * @returns {object} An object containing the generated token and accessToken.
 */
const generateJwtToken = (userId, expiresIn = '1h') => {
  const payload = { _id: userId };
  const token = jwt.sign(payload, jwtKey, { expiresIn });
  const accessToken = jwt.sign(payload, `${jwtKey}-access`, {
    expiresIn,
  });
  return { token, accessToken };
};

/**
 * Generate account activation url
 * @param {string} passwordOrKey jwt secret key to be used to validate token. For this purpose we will use the user's encrypted password as secretKey
 * @param {string} userId The user id
 * @param {string} email The user email
 * @param {string} type The type of account activation
 * @param {string} expiresIn The expiry time.
 * @returns {string} activationUrl
 */
const generateAccountActivationUrl = (
  passwordOrKey,
  userId,
  email,
  type,
  expiresIn = '24h',
) => {
  const token = jwt.sign({ _id: userId }, passwordOrKey, { expiresIn });
  // Change this with the appropriate route that will open your client side and send the token and email to the activate endpoint
  const url = `${appDomain}/activate?token=${token}&email=${email}`;
  return url;
};

/**
 *
 * @param time
 */
const sleep = (time) =>
  new Promise((resolve, reject) => setTimeout(resolve, time));

/**
 * Function implementation to handle route controller asynchronously with error catching
 * @param {Function} fn Route Controller
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((error) => next(error));

/**
 *
 * @param stream
 */
function bufferStream(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

/**
 *
 * @param stream
 * @param algorithm
 */
const getFileHashFromStream = async (stream, algorithm = 'sha256') => {
  const buffer = await bufferStream(stream);
  const hash = crypto.createHash(algorithm).update(buffer).digest('hex');
  const newStream = new PassThrough();
  newStream.end(buffer);
  Object.setPrototypeOf(stream, Object.getPrototypeOf(newStream));
  Object.assign(stream, newStream);
  return hash;
};
/**
 * Generates a SHA-256 hash of the given string
 * If a length is specified, the hash is truncated to that length.
 * @param {string} str - The input string to be hashed.
 * @param {number} [length] - Optional length to truncate the hash.
 * @param toUpperCase
 * @returns {string} The resulting hash, optionally truncated.
 */
const hashString = (str, length, toUpperCase = true) => {
  const hashedValue = crypto
    .createHash('sha256')
    .update(String(str))
    .digest('hex');
  const hashed = length ? hashedValue.slice(0, length) : hashedValue;
  return toUpperCase ? hashed.replace(/\w*/g, (s) => s.toUpperCase()) : hashed;
};

/**
 *
 * @param query
 * @param searchField
 */
const parsePaginationAndSort = (query, searchField) => {
  const { pageSize, current, total, field, order, searchTerm } = query;
  const $sort = field && { [field]: order?.includes('desc') ? -1 : 1 };
  const $skip = (current - 1) * pageSize;
  const $limit = pageSize;
  const pagination = { current, pageSize, total };

  let searchQuery;
  if (searchField && searchTerm)
    searchQuery = { [searchField]: { $regex: searchTerm, $options: 'i' } };

  return { $sort, $skip, $limit, pagination, searchQuery };
};
/**
 *
 * @param fn
 */
const tryAsync =
  (fn) =>
  async (...args) => {
    try {
      return [await fn(...args), null];
    } catch (err) {
      return [null, err];
    }
  };

/**
 *
 * @param prefix
 */
const startsWith = (prefix) => (line) => line.startsWith(prefix);

const insecureAgent = new https.Agent({ rejectUnauthorized: false });

/**
 *
 * @param url
 */
const fetchPdfBuffer = async (url) =>
  (
    await axios.get(url, {
      httpsAgent: insecureAgent,
      responseType: 'arraybuffer',
    })
  ).data;

/**
 *
 * @param buffer
 */
// const parsePdfToLines = async (buffer) => (await pdf(buffer)).text.split('\n');
/* const parsePdfToLines = async (buffer) => {
  const pdf = (await import('pdf-parse')).default;
  const data = await pdf(buffer);
  return data.text.split('\n');
}; */
/**
 *
 * @param buffer
 */
export const parsePdfToLines = async (buffer) => {
  const pdfParser = new PDFParser(null, 1);

  return new Promise((resolve, reject) => {
    pdfParser.on('pdfParser_dataError', (err) =>
      reject(err?.parserError || err),
    );
    pdfParser.on('pdfParser_dataReady', () => {
      try {
        const text = pdfParser.getRawTextContent();
        const lines = text.split('\n').filter((line) => line.trim() !== '');
        resolve(lines);
      } catch (err) {
        reject(err);
      }
    });

    try {
      pdfParser.parseBuffer(buffer);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 *
 * @param lines
 */
const findValue = (lines) => (prefix) =>
  lines.find(startsWith(prefix))?.replace(prefix, '').trim() ?? null;

/**
 *
 * @param url
 */
const getParsedObject = async (url) => {
  const pdfBuffer = await fetchPdfBuffer(url);

  const lines = await parsePdfToLines(pdfBuffer);
  const value = findValue(lines);

  const receiverLineIdx = lines.indexOf(`Receiver${value('Receiver')}`);
  /* const receiverAccount = lines
    .find((l, i) => l.startsWith('Account') && i > receiverLineIdx)
    ?.replace('Account', '')
    .trim(); */
  const receiverAccount = lines
    .filter((l) => l.startsWith('Account'))[1] // 0 = first, 1 = second
    ?.replace('Account', '')
    .trim();

  const a = {
    payer: value('Payer'),
    payerAccount: value('Account'),
    receiver: value('Receiver'),
    receiverAccount,
    paymentDateTime: value('Payment Date & Time'),
    reference: value('Reference No. (VAT Invoice No)'),
    reason: value('Reason / Type of service'),
    transferredAmount: Math.round(
      parseFloat(value('Transferred Amount').replace(/[^0-9.]/g, '')),
    ),
    totalDebited: Math.round(
      parseFloat(
        value('Total amount debited from customers account').replace(
          /[^0-9.]/g,
          '',
        ),
      ),
    ),
  };
  return a;
};

/**
 * Verify payment
 * @param {object} opts
 * @param {string} opts.transactionId - Transaction reference
 * @param {string} opts.amount - Expected amount
 * @param {string} opts.method - Payment method
 * @returns {Promise<boolean>}
 */
const verifyPayment = async ({ transactionId, amount, method }) => {
  if (method !== paymentMethodsMap.CBE) return false;
  if (!transactionId) {
    throw new APIError({
      userMessage: 'Transaction reference is required',
      status: 400,
    });
  }

  const [result, err] = await tryAsync(async () => {
    const urlMap = {
      [paymentMethodsMap.Abyssinia]: `https://cs.bankofabyssinia.com/slip/?trx=${transactionId}`,
      [paymentMethodsMap.CBE]: `https://apps.cbe.com.et:100/?id=${transactionId}${cbeAccountExtension}`,
    };

    const parsed = await getParsedObject(urlMap[method]);
    const {
      receiver,
      receiverAccount,
      reference,
      transferredAmount,
      totalDebited,
    } = parsed;

    const last3 = receiverAccount?.slice(-3);

    const checks = {
      receiverName: receiver === receiverName,
      reference: reference === transactionId,
      amount: transferredAmount === amount,
      account:
        receiverAccount.slice(-4) === cbeAccountEnd ||
        receiverAccount === abyssiniaAccountEnd,
    };

    const matched =
      checks.receiverName &&
      checks.reference &&
      checks.amount &&
      checks.account;

    return (
      (method === paymentMethodsMap.CBE && matched) ||
      (method === paymentMethodsMap.Abyssinia && matched) ||
      false
    );
  })();

  if (err) {
    winstonLogger.error('Error verifying transaction:', err.message);
    throw new APIError({
      status: err.status || 500,
      userMessage: err.message || 'Failed to verify transaction',
    });
  }

  return result;
};

export {
  generateHashedPassword,
  generateJwtToken,
  generateAccountActivationUrl,
  asyncHandler,
  getFileHashFromStream,
  hashString,
  parsePaginationAndSort,
  verifyPayment,
};
