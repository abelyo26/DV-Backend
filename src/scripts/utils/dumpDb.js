const { exec } = require('child_process');
const fs = require('fs');

const { checkDumpExists } = require('.');

const dumpDir = './dumps';

/**
 * Dump the given collections in the given database
 * @async
 * @param {string} cmd Command to execute
 * @returns {Promise<unknown>} The function can return any type of value.
 */
const execMongodb = async (cmd) => {
  return new Promise((resolve, reject) => {
    let logs = '';

    const execution = exec(
      `${cmd}`,
      {
        maxBuffer: 10486750,
      },
      (err, stdout) => {
        if (err) {
          reject(err);
        }

        resolve(stdout);
      },
    );

    execution?.stdout?.on('data', (data) => {
      logs += data;
    });
    execution?.stderr?.on('data', (data) => {
      logs += data;
    });

    execution.on('exit', (code) => {
      console.info(
        `🔵 [LOGS] : ${code === 0 ? '🟢 [Success]' : '🔴 [Failed]'}`,
      );
      console.info(`🔵 [LOGS] : ${logs}`);
    });
  });
};

/**
 * Dump the given collections in the given database
 * @async
 * @param {object} options Options required to create dump
 * @param {string} options.databaseName Database name to dump
 * @param {string[]} [options.collections] List of collection names to dump
 * @param {string} [options.reference] Reference to add to the dump file name for dump rollback
 * @returns {Promise<any>} The function can return any type of value.
 */
const createDump = async ({ databaseName, collections, reference }) => {
  const dumpDate = new Date().toISOString();

  if (
    !collections ||
    !Array.isArray(collections) ||
    collections?.length === 0
  ) {
    return undefined;
  }

  return Promise.all(
    collections.map(async (collection) => {
      const dumpPath = `${dumpDir}/${collection}/${reference}-dump-${dumpDate}`;

      try {
        await fs.promises.mkdir(dumpPath, { recursive: true });

        await execMongodb(
          `mongodump -d ${databaseName} -c ${collection.toLowerCase()} --archive=${dumpPath}/${reference}.gz --gzip`,
        );
      } catch (error) {
        console.error(`🔴 [Failed] : ${error.message}`);
      }
    }),
  );
};

/**
 * Description placeholder
 * @async
 * @param {object} options - Options required to restore dump
 * @param {string} options.reference - Reference to add to the dump file name for dump rollback
 * @param {string[]} options.collections - List of collection names to dump
 * @returns {Promise<any>} - The function can return any type of value.
 */
const restoreDumb = async ({ reference, collections }) => {
  return Promise.all(
    collections.map(async (collection) => {
      const pathRestore = `${dumpDir}/${collection}`;

      const collectionDump = checkDumpExists({
        directory: pathRestore,
        reference,
      });

      if (collectionDump.exists) {
        const restoreFrom = `${pathRestore}/${collectionDump.fileName}/${reference}.gz`;

        return execMongodb(
          `mongorestore --verbose --drop --gzip --archive=${restoreFrom}`,
        );
      }

      console.error(`🔴 [Failed] : Dump for ${collection} does not exist`);

      return undefined;
    }),
  );
};

module.exports = {
  createDump,
  execMongodb,
  restoreDumb,
};
