const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generate a random base64 string.
 * @param {number} length - The length of the string to generate.
 * @returns {string} The generated base64 string.
 */
const generateBase64String = (length) => {
  const base64String = crypto.randomBytes(length).toString('base64');
  return base64String;
};

/**
 * Check if a directory exists.
 * @param {string} curPath - The path to check.
 * @returns {boolean} Whether the directory exists.
 * @throws {Error} If an unexpected error occurs.
 */
const directoryExists = (curPath) => {
  try {
    fs.readdirSync(curPath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
};

/**
 * Check if a dump exists.
 * @param {object} options - The options object.
 * @param {string} options.directory - The directory to check.
 * @param {string} options.reference - The reference to check.
 * @returns {{ exists: boolean , fileName?: string }} The dump object.
 */
const checkDumpExists = ({ directory, reference }) => {
  try {
    const files = fs.readdirSync(directory);
    const dump = { exists: false };

    for (let i = 0; i < files.length; i += 1) {
      if (files[i].startsWith(reference)) {
        dump.exists = true;
        dump.fileName = files[i];
        break;
      }
    }

    return dump;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { exists: false };
    }

    console.info('🔴 [Error] : Error occurred while checking dump', error);

    throw error;
  }
};

/**
 * @callback validateCallback
 * @param {import('..').ParsedData} item - The item to validate.
 * @returns {boolean}
 */

/**
 * Partition an array based on validation results.
 * @param {import('..').ParsedData[]} arr - The array to process.
 * @param {validateCallback} validate - The callback function.
 * @returns {Array<Array<import('..').ParsedData>>} - The partitioned array.
 */
function partitionArray(arr, validate) {
  return arr.reduce(
    /**
     * Accumulator function to split the array based on validation results.
     * @param {Array<Array<import('..').ParsedData>>} acc - The accumulator array containing two arrays for valid and invalid items.
     * @param {import('..').ParsedData} item - The item to process.
     * @returns {Array<Array<import('..').ParsedData>>} The updated accumulator array with the item added to the corresponding array.
     */
    (acc, item) => {
      const isValid = validate(item);
      acc[isValid ? 0 : 1].push(item);
      return acc;
    },
    [[], []],
  );
}

/**
 * Split the reference date from the file name.
 * @param {string} str - The string to process.
 * @returns {string} The date path.
 */
const splitRefDate = (str) => {
  const datePath = str?.split(
    /-(?=\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)/,
  )[1];

  return datePath;
};

/**
 * Initialize migrations
 * @param {import('..').ParsedData[]} validCollections - The valid collections.
 * @returns {*} The migrations.
 */
const initializeMigrations = (validCollections) =>
  new Promise((resolve, reject) => {
    try {
      const migrations = validCollections
        .map((collection) => {
          const migrationPath = path.resolve(
            __dirname,
            '..',
            'migrations',
            collection?.collection,
          );

          if (collection?.reference) {
            const referenceExists = checkDumpExists({
              directory: migrationPath,
              reference: collection.reference,
            });

            if (referenceExists.exists && referenceExists.fileName) {
              const filePath = path.join(
                migrationPath,
                referenceExists.fileName,
              );

              const migration = require(filePath);

              return migration;
            }

            console.info(
              `🔴 [INFO] : The reference "${collection.reference}" for collection ${collection.collection} does not exist`,
            );

            return {};
          }

          if (!directoryExists(migrationPath)) {
            console.info(
              `🔴 [INFO] : Migration path "${migrationPath}" does not exist`,
            );
            process.exit(1);
          }

          const regex = new RegExp(
            `\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z-${collection.collection}\\.js$`,
          );

          const filePath = fs
            .readdirSync(migrationPath)
            .reduce((latest, current) => {
              const currentDate = splitRefDate(current);
              const latestDate = splitRefDate(latest) || '';

              if (regex.test(current))
                return currentDate > latestDate ? current : latest;

              return latest;
            }, '');

          if (!filePath) {
            console.info(
              `🔴 [INFO] : No migration file found for collection ${collection.collection}`,
            );
            return {};
          }

          const migrationFile = path.join(migrationPath, filePath);

          const migration = require(migrationFile);

          return migration;
        })
        .filter((migration) => Object.keys(migration).length > 0);

      resolve(migrations);
    } catch (error) {
      console.error(
        '🔴 [Error] : Error occurred while initializing migration',
        error,
      );
      reject(error);
    }
  });

module.exports = {
  checkDumpExists,
  directoryExists,
  generateBase64String,
  initializeMigrations,
  partitionArray,
};
