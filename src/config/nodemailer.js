import nodemailer from 'nodemailer';

import { appEmailAddress, appEmailPassword, appName } from './environments';
import winstonLogger from './winston';

/**
 * Get the nodemailer transporter
 * @returns {Promise} - Promise of nodemailer transporter
 */
const getMailer = async () => {
  try {
    /* const config = {
      host: 'hotmail', // or your SMTP server
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: appEmailAddress,
        pass: appEmailPassword,
      },
    }; */

    const config = {
      host: 'smtp.office365.com',
      port: 587,
      secure: false, // use STARTTLS
      auth: {
        user: appEmailAddress, // e.g. yourname@outlook.com
        pass: appEmailPassword, // your Outlook password or app password
      },
      tls: {
        rejectUnauthorized: false, // optional; helps if your host has self-signed certs
      },
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

/**
 * Send mail using the configured transport
 * @param {object} mailOptions - The mail options
 * @param {string} [mailOptions.from] - From address (defaults to app name and email)
 * @param {string} mailOptions.to - To address
 * @param {string} mailOptions.title - Email title
 * @param {string} mailOptions.subject - Email subject
 * @param {string} mailOptions.text - Plain text body
 * @param {string} mailOptions.html - HTML body
 * @returns {Promise<void>}
 */
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
      winstonLogger.error(`Error sending email: ${error}`);
    } else {
      winstonLogger.info(`Email sent: ${info.response}`);
    }
  });
};

/**
 * Send error notification email
 * @param {Error} error - The error object
 * @param {string} source - Source of the error
 * @returns {Promise<void>}
 */
const sendErrorNotification = async (error, source = 'Server') => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';

  try {
    await sendMail({
      to: appEmailAddress,
      subject: `[${appName}] Error Notification: ${source}`,
      text: `
An error occurred in the ${appName} application:

Source: ${source}
Time: ${new Date().toISOString()}
Error Message: ${errorMessage}
${errorStack ? `\nStack Trace:\n${errorStack}` : ''}
      `,
      html: `
<h2>Error Notification</h2>
<p>An error occurred in the <strong>${appName}</strong> application.</p>
<p><strong>Source:</strong> ${source}</p>
<p><strong>Time:</strong> ${new Date().toISOString()}</p>
<p><strong>Error Message:</strong> ${errorMessage}</p>
${errorStack ? `<p><strong>Stack Trace:</strong></p><pre>${errorStack}</pre>` : ''}
      `,
    });
  } catch (err) {
    winstonLogger.error(`Failed to send error notification email: ${err}`);
  }
};

/**
 * Send notification about failed API request
 * @param {object} req - Express request object
 * @param {Error} error - The error object
 * @returns {Promise<void>}
 */
const sendApiFailureNotification = async (req, error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStatus = error.status || 500;

  try {
    await sendMail({
      to: appEmailAddress,
      subject: `[${appName}] API Request Failed`,
      text: `
A request to the API has failed:

Endpoint: ${req.method} ${req.originalUrl}
Status Code: ${errorStatus}
Time: ${new Date().toISOString()}
User: ${req.user ? `ID: ${req.user._id}` : 'Not authenticated'}
IP Address: ${req.ip}
Error: ${errorMessage}
      `,
      html: `
<h2>API Request Failed</h2>
<p>A request to the API has failed.</p>
<p><strong>Endpoint:</strong> ${req.method} ${req.originalUrl}</p>
<p><strong>Status Code:</strong> ${errorStatus}</p>
<p><strong>Time:</strong> ${new Date().toISOString()}</p>
<p><strong>User:</strong> ${req.user ? `ID: ${req.user._id}` : 'Not authenticated'}</p>
<p><strong>IP Address:</strong> ${req.ip}</p>
<p><strong>Error:</strong> ${errorMessage}</p>
      `,
    });
  } catch (err) {
    winstonLogger.error(
      `Failed to send API failure notification email: ${err}`,
    );
  }
};

/**
 * Send notification about new application
 * @param {object} application - The application object
 * @returns {Promise<void>}
 */
const sendNewApplicationNotification = async (application) => {
  try {
    await sendMail({
      to: 'abelyo26@gmail.com',
      subject: `[${appName}] New Application Submitted`,
      text: `
A new application has been submitted:

Application ID: ${application._id}
Applicant: ${application.applicant.firstName} ${application.applicant.lastName}
Email: ${application.applicant.email}
Phone: ${application.applicant.phone}
Status: ${application.status}
Payment Status: ${application.payment.status}
Payment Method: ${application.payment.paymentMethod}
Submitted at: ${new Date(application.createdAt).toISOString()}
      `,
      html: `
<h2>New Application Submitted</h2>
<p>A new application has been submitted to the ${appName} system.</p>
<p><strong>Application ID:</strong> ${application._id}</p>
<p><strong>Applicant:</strong> ${application.applicant.firstName} ${application.applicant.lastName}</p>
<p><strong>Email:</strong> ${application.applicant.email}</p>
<p><strong>Phone:</strong> ${application.applicant.phone}</p>
<p><strong>Status:</strong> ${application.status}</p>
<p><strong>Payment Status:</strong> ${application.payment.status}</p>
<p><strong>Payment Method:</strong> ${application.payment.paymentMethod}</p>
<p><strong>Submitted at:</strong> ${new Date(application.createdAt).toISOString()}</p>
      `,
    });
  } catch (err) {
    winstonLogger.error(
      `Failed to send new application notification email: ${err}`,
    );
  }
};

export {
  getMailer,
  nodeMailerVerify,
  sendMail,
  sendErrorNotification,
  sendApiFailureNotification,
  sendNewApplicationNotification,
};
