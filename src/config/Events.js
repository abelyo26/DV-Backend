import { EventEmitter } from 'events';

import { appName } from './environments';
import { getMailer } from './nodemailer';
import winstonLogger from './winston';

import { generateAccountActivationUrl } from '../utils';
import createMail from '../utils/templates/createMail';

const events = new EventEmitter();

events.on('error', (err) => {
  winstonLogger.error(err);
});

events.on('verifyEmail', async (info) => {
  const { email, password, _id } = info;

  const activationUrl = generateAccountActivationUrl(
    password,
    _id,
    email,
    'verify',
  );

  const mailTemplate = createMail({
    description: 'Verify Your Email For Full Access',
    link: activationUrl,
    linkLabel: 'Active Account',
    title: 'Email Verification',
  });

  const mailData = {
    from: `"${appName}" <${process.env.APP_EMAIL_ADDRESS}>`,
    html: mailTemplate,
    subject: `Activate your ${appName} account`,
    to: email,
  };

  try {
    const mailer = await getMailer();
    await mailer?.sendMail(mailData);
  } catch (error) {
    winstonLogger.error(error);
  }
});

export default events;
