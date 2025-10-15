require('dotenv').config();

const { confirm } = require('@inquirer/prompts');

const connectToDb = require('../../config/mongoose');
const { initializeMigrations } = require('../utils');

const db = process.env.DB_NAME;

/**
 * Handle migration
 * @param {import('..').ParsedData[]} validCollections - The array of valid collections to run migration on
 * @param {object} options - The options object
 * @param {boolean} options.force - The force flag to force run migration
 * @param {boolean} options.all - The all flag to run migration on all collections
 * @returns {void}
 */
const handleMigration = (validCollections, options) => {
  connectToDb
    .default()
    .then(async () => {
      const migrations = await initializeMigrations(validCollections);

      if (migrations.length === 0) {
        console.info(
          '🔵 [Info] : No migrations found file for the defined collections',
        );
        process.exit(0);
      }

      try {
        await Promise.all(
          migrations.map(async (migration) => {
            await migration.migrate(db, options);
          }),
        );
        console.info('🟢 [Completed] : Migrations run completed without Error');
        process.exit(0);
      } catch (error) {
        console.error(
          '🔴 [Error] : Error occurred while running migrations',
          error,
        );
        process.exit(1);
      }
    })
    .catch(() => {
      process.exit(1);
    });
};

/**
 * Handle Rollback
 * @param {import('..').ParsedData[]} validCollections - The array of valid collections to rollback database
 * @param {object} options - The options object
 * @param {boolean} options.all - The all flag to rollback all migrations
 * @param {boolean} options.force - The force flag to force rollback
 */
const handleRollback = (validCollections, options) => {
  connectToDb
    .default()
    .then(async () => {
      const migrations = await initializeMigrations(validCollections);

      if (migrations.length === 0) {
        console.info(
          '🔵 [Info] : No migrations found file for the defined collections',
        );
        process.exit(0);
      }

      try {
        const answer = await confirm({
          message:
            'Are you sure you want to rollback you will loose the previous data?',
        });

        if (!answer) {
          console.info('🔵 [Info] : Rollback aborted by the user');
          process.exit(0);
        }

        await Promise.all(
          migrations.map(async (migration) => {
            await migration.rollback(options);
          }),
        );
        console.info(
          '🟢 [Completed] : Migration rollback completed without error',
        );
        process.exit(0);
      } catch (error) {
        console.error(
          '🔴 [Error] : Error occurred while running migrations rollback',
          error,
        );
        process.exit(1);
      }
    })
    .catch(() => {
      console.error(
        '🔴 [Error] : Error occurred while running migrations rollback',
      );
      process.exit(1);
    });
};

module.exports = {
  handleMigration,
  handleRollback,
};
