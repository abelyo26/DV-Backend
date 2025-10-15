import { google } from 'googleapis';
import nodemailer from 'nodemailer';

import {
  appEmailAddress,
  appName,
  googleClientId,
  googleClientSecret,
  googleRedirectUri,
  googleRefreshToken,
} from './environments';
import winstonLogger from './winston';

/**
 * Get the nodemailer transporter
 * @returns {Promise} - Promise of nodemailer transporter
 */
const getMailer = async () => {
  try {
    const OAuth2Client = new google.auth.OAuth2({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      redirectUri: googleRedirectUri,
    });

    OAuth2Client.setCredentials({ refresh_token: googleRefreshToken });

    const accessToken = await new Promise((resolve, reject) => {
      OAuth2Client.getAccessToken((err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      });
    });

    const config = {
      auth: {
        accessToken,
        clientId: googleClientIdEmail,
        clientSecret: googleClientSecretEmail,
        refreshToken: googleRefreshToken,
        type: 'OAuth2',
        user: appEmailAddress,
      },
      service: 'gmail',
    };

    const mailer = nodemailer.createTransport(config);

    return mailer;
  } catch (error) {
    console.error('[ERROR] : occurred while creating nodemailer transport');
    winstonLogger.error(
      `[Nodemailer Loader] Error occurred while creating nodemailer transport: ${error}`,
    );
  }
};

/**
 * Verify the nodemailer transporter
 */
const nodeMailerVerify = async () => {
  const Mailer = await getMailer();
  Mailer?.verify((err) => {
    if (err) {
      winstonLogger.error(
        `[Nodemailer Loader] Verifying mailing account failed: ${err}`,
      );
    }
    winstonLogger.info(`[Nodemailer] Ready to send messages`);
  });
};

const sendMail = async ({
  from = `"${appName}" <${appEmailAddress}>`,
  to,
  title,
  subject,
  text,
  html,
}) => {
  const Mailer = await getMailer();
  Mailer.sendMail({ from, to, title, subject, text, html }, (error, info) => {
    if (error) {
      console.error('Error sending email: ', error);
    } else {
      console.log('Email sent: ', info.response);
    }
  });
};

export { getMailer, nodeMailerVerify, sendMail };
