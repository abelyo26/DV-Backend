const { modelNames } = require('../../src/utils/constants');

/**
 * get the migration action config
 * @param {string} componentPath - directory path to the model
 * @param {string} baseGeneratorPath - base path to the generator
 * @returns {Array} - array of actions
 */
const getModelActionsConfig = (componentPath, baseGeneratorPath) => [
  {
    abortOnFail: true,
    path: `${componentPath}/index.js`,
    templateFile: './templates/models/model.js.hbs',
    type: 'add',
  },
  {
    abortOnFail: true,
    path: `${componentPath}/schema.js`,
    templateFile: './templates/models/schema.js.hbs',
    type: 'add',
  },
  {
    abortOnFail: true,
    path: `${componentPath}/methods.js`,
    templateFile: './templates/models/method.js.hbs',
    type: 'add',
  },
  {
    abortOnFail: true,
    path: `${componentPath}/statics.js`,
    templateFile: './templates/models/static.js.hbs',
    type: 'add',
  },
  {
    abortOnFail: true,
    path: `${baseGeneratorPath}/utils/constants.js`,
    pattern: new RegExp(/.*\/\/.*\[INSERT NEW MODEL KEY ABOVE\].+\n/),
    templateFile: './templates/constants.js.hbs',
    type: 'modify',
  },
];

/**
 *  get the route action config
 * @param {string} baseGeneratorPath - base path to the generator
 * @param {string} answers - answers from the user
 * @returns {Array} - array of actions
 */
const getRouteActionsConfig = (baseGeneratorPath, answers) => [
  {
    abortOnFail: true,
    path: `${baseGeneratorPath}/controllers/${answers.modelName}.js`,
    templateFile: './templates/controller.js.hbs',
    type: 'add',
  },
  {
    abortOnFail: true,
    path: `${baseGeneratorPath}/routes/${answers.modelName}.js`,
    templateFile: './templates/routes/route.js.hbs',
    type: 'add',
  },
  {
    abortOnFail: true,
    path: `${baseGeneratorPath}/config/routes.js`,
    pattern: new RegExp(/.*\/\/.*\[INSERT NEW ROUTE EXPORT\].+\n/),
    templateFile: './templates/routes/route.config.js.hbs',
    type: 'modify',
  },
  {
    abortOnFail: true,
    path: `${baseGeneratorPath}/config/routes.js`,
    pattern: new RegExp(/.*\/\/.*\[INSERT NEW ROUTE IMPORT\].+\n/),
    templateFile: './templates/routes/route.import.js.hbs',
    type: 'modify',
  },
  {
    abortOnFail: true,
    path: `${baseGeneratorPath}/validators/${answers.modelName}.validator.js`,
    templateFile: './templates/validator.js.hbs',
    type: 'add',
  },
  {
    abortOnFail: true,
    path: `${baseGeneratorPath}/../__tests__/routes/${answers.modelName}s/${answers.modelName}.test.js`,
    templateFile: './templates/test.js.hbs',
    type: 'add',
  },
];

/**
 * get the migration action config
 * @param {string} componentPath - directory path to the model
 * @param {string} fileName - file name for the migration
 * @param {string} reference - reference for the migration
 * @returns {Array} - array of actions
 */
const getMigrationActionConfig = (componentPath, fileName, reference) => [
  {
    abortOnFail: true,
    data: {
      reference,
    },
    path: `${componentPath}/${fileName}`,
    templateFile: './templates/migration.js.hbs',
    type: 'add',
  },
];

/**
 * inquirer prompts
 * @param {object} newModelCounterparts - model counterparts
 * @param {object} typeGeneration - type of generation
 * @returns {Array} - array of prompts
 */
const inquirerPrompts = (newModelCounterparts, typeGeneration) => [
  {
    choices: ['Model', 'Migration'],
    message: 'What do you want to create?',
    name: 'modelType',
    type: 'list',
  },
  {
    message: 'What should your model name be called?',
    name: newModelCounterparts.modelName,
    type: 'input',
    /**
     * check if the response is a model
     * @param {string} response - response from the user
     * @returns {boolean} - returns true if the response is a model
     */
    when(response) {
      return response.modelType === typeGeneration.Model;
    },
  },
  {
    default: false,
    message: 'Do you Want a route for your model?',
    name: newModelCounterparts.wantRoute,
    type: 'confirm',
    /**
     * check if the response is a model
     * @param {string} response - response from the user
     * @returns {boolean} - returns true if the response is a model
     */
    when(response) {
      return response.modelType === typeGeneration.Model;
    },
  },
  {
    choices: Object.keys(modelNames),
    loop: false,
    message: 'What should your migration name be called?',
    name: newModelCounterparts.modelName,
    type: 'rawlist',
    /**
     * check if the response is a migration
     * @param {string} response - response from the user
     * @returns {boolean} - returns true if the response is a migration
     */
    when(response) {
      return response.modelType === typeGeneration.Migration;
    },
  },
];

module.exports = {
  getMigrationActionConfig,
  getModelActionsConfig,
  getRouteActionsConfig,
  inquirerPrompts,
};
