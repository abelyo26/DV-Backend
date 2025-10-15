require('dotenv').config();

const fs = require('fs');
const path = require('path');

const { select } = require('@inquirer/prompts');
const { Command } = require('commander');

const { handleMigration, handleRollback } = require('./commands');
const { partitionArray } = require('./utils');

const { modelNames } = require('../utils/constants');

const program = new Command();

const db = process.env.DB_NAME;

program
  .name('Scripts')
  .description(
    'For managing scripts. Execute, create, edit, delete, and list scripts.',
  )
  .version('0.0.1');

program
  .command('list-migrations')
  .description('List all available migration scripts and run them')
  .addHelpText(
    'after',
    `
    Examples:
      $ migration-scripts list
  `,
  )
  .option('-f, --force', 'Force run migration')
  .action(async (options) => {
    try {
      const migrationPath = path.join(__dirname, '../scripts/migrations');

      if (
        !fs.existsSync(migrationPath) ||
        !fs.lstatSync(migrationPath).isDirectory()
      ) {
        console.info('🟢 [ Info ] : No migration scripts found');
        return;
      }

      const collections = fs.readdirSync(migrationPath);

      if (collections.length === 0) {
        console.info('🟢 [ Info ] : No migration scripts found');
        return;
      }

      const answer = await select({
        choices: collections.map((collection) => ({
          name: `[ ${collection} ] collection`,
          value: collection,
        })),
        loop: false,
        message: 'Select a collection to list migration scripts 👇',
        pageSize: 10,
        theme: {
          icon: {
            cursor: '👉',
          },
        },
      });

      const collectionPath = path.join(migrationPath, answer);

      if (
        !fs.lstatSync(collectionPath).isDirectory() ||
        !fs.existsSync(collectionPath)
      ) {
        console.info(`🟢 [ Info ] : No migration scripts found for ${answer}`);
        return;
      }

      const migrationScripts = fs.readdirSync(collectionPath);

      const selectedMigration = await select({
        choices: migrationScripts.map((migration) => ({
          name: `Run -> [ ${migration} ]`,
          value: migration,
        })),
        loop: false,
        message: 'Select a migration script to run 👇',
        pageSize: 10,
        theme: {
          icon: {
            cursor: '👉',
          },
        },
      });

      const migrationFile = path.join(collectionPath, selectedMigration);

      const migration = require(migrationFile);

      await migration.migrate(db, options);
    } catch (error) {
      console.error('[ ERROR ] while listing migration scripts: ', error);
    }
  });

/**
 * @typedef {object} ParsedData
 * @property {string} collection - Collection name
 * @property {string} reference - Reference to migration script
 */

program
  .command('migrate')
  .description('running migration on multiple collections and references')
  .addHelpText(
    'after',
    `
    Examples:
      $ run-script migrate collection1:reference1 collection2:reference2
  `,
  )
  .argument(
    '<collections...>',
    'Collection name and reference to migration script separated by colon. Eg. collectionName:reference',
    /**
     * Function to parse the collection name and reference from the argument
     * @param {string} current - Current argument
     * @param {ParsedData[]} prev - Parsed data
     * @returns {ParsedData[]} - Parsed data
     */ (current, prev) => {
      const data = current.split(':');

      const parsedData = { collection: data[0], reference: data[1] };
      return prev.concat([parsedData]);
    },
    [],
  )
  .option('-f, --force', 'Force run migration')
  .option('-a, --all', 'Run migration on all collections')
  .action((args, options) => {
    const allCollections = Object.keys(modelNames);

    const [validCollections, invalidCollections] = partitionArray(
      args,
      (item) => allCollections.includes(item.collection),
    );

    invalidCollections.forEach((item) => {
      console.info(
        `🟢 [Info] : Collection "${item.collection}" is not a valid collection
    `,
      );
    });

    handleMigration(validCollections, options);
  });

program
  .command('rollback')
  .description('Rollback migration on multiple collections and references')
  .addHelpText(
    'after',
    `
      Examples:
        $ run-script rollback collection1:reference1 collection2:reference2
    `,
  )
  .argument(
    '<collections...>',
    'Collection name and reference to migration script separated by colon. Eg. collectionName:reference',
    /**
     * Function to parse the collection name and reference from the argument
     * @param {string} current - Current argument
     * @param {ParsedData[]} prev - Parsed data
     * @returns {ParsedData[]} - Parsed data
     */
    (current, prev) => {
      const data = current.split(':');

      const parsedData = { collection: data[0], reference: data[1] };
      return prev.concat([parsedData]);
    },
    [],
  )
  .option('-f, --force', 'Force rollback')
  .option('-a, --all', 'Rollback all migrations')
  .action((args, options) => {
    const allCollections = Object.keys(modelNames);

    const [validCollections, invalidCollections] = partitionArray(
      args,
      (item) => allCollections.includes(item.collection),
    );

    invalidCollections.forEach((item) => {
      console.info(
        `🟢 [Info] : Collection "${item.collection}" is not a valid collection
      `,
      );
    });

    handleRollback(validCollections, options);
  });

program.showHelpAfterError();
program.parseAsync(process.argv);
