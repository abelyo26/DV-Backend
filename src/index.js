import path from 'path';

// Initiate app root
global.appRoot = path.resolve(path.resolve());
import passport from 'passport';

import * as environments from './config/environments';
import app from './config/express';
import connectToDb from './config/mongoose';
import { nodeMailerVerify } from './config/nodemailer';
import passportInit from './config/passport';

// Init passport
passportInit(passport);

/**
 * Start the server
 */
const start = async () => {
  if (!module.parent) {
    await connectToDb().then(async () => {
      console.info(`connected to db`);
      app.listen(environments.port, () => {
        console.info(
          `[${environments.nodeEnv}] Server running on localhost:${environments.port}`,
        );
      });
    });
    nodeMailerVerify();
  }
};

start();
export default app;
