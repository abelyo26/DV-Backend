import fs from 'fs';
import path from 'path';

import mongoose from 'mongoose';

import * as environments from './environments';

const modelsPath = path.join(process.cwd(), 'src/models');

// Initialize all models in src/models directory

fs.readdirSync(modelsPath)
  .filter((dir) => dir.indexOf(''))

  .forEach((dir) => require(path.join(modelsPath, dir)));

/**
 * Connect to the database
 */
const connectToDb = async () => {
  try {
    const connectOptions = {};

    console.log('------------>', environments.mongoUrl);

    const db = await mongoose.connect(environments.mongoUrl, connectOptions);

    if (environments.nodeEnv !== 'test') {
      console.info(`Mongo Connection Successfull`);
    }
    return db;
  } catch (error) {
    console.error(`Mongo Connection Failed`, error);
    throw error;
  }
};

export default connectToDb;
