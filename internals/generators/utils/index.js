const crypto = require('crypto');
const fs = require('fs');

const {
  getMigrationActionConfig,
  getModelActionsConfig,
  getRouteActionsConfig,
} = require('../constants');

/**
 * Check if a path exists
 * @param {string} path - path to check
 * @returns {boolean} - returns true if the path exists
 */
const pathExists = (path) => {
  return fs.existsSync(path);
};

/**
 * Generate a random base64 string
 * @param {number} length - length of the string
 * @returns {string} - base64 string
 */
const generateBase64String = (length) => {
  const base64String = crypto
    .randomBytes(length)
    .toString('base64')
    .replace(/\//g, '_');

  return base64String;
};

/**
 * Get the migration action config
 * @param {string} baseGeneratorPath - directory path to the model
 * @param {string} answers - answers from the user
 * @param {Array} actions - array of actions
 */
const getMigrationActions = (baseGeneratorPath, answers, actions) => {
  const currentDate = new Date().toISOString();

  const componentPath = `${baseGeneratorPath}/scripts/migrations/${answers.modelName}`;
  const actualComponentPath = `${baseGeneratorPath}/scripts/migrations/${answers.modelName}/${currentDate}-user-migration.js`;

  if (pathExists(actualComponentPath)) {
    throw new Error(`Migration '${answers.modelName}' already exists`);
  }

  const reference = generateBase64String(6);

  const migrationActions = getMigrationActionConfig(
    componentPath,
    `${reference}-${currentDate}-${answers.modelName}.js`,
    reference,
  );

  actions.push(...migrationActions);

  actions.push({
    data: {
      path: `${baseGeneratorPath}/scripts/migrations/${answers.modelName}`,
    },
    type: 'prettify',
  });
};

/**
 * Get the model actions
 * @param {string} baseGeneratorPath - directory path to the model
 * @param {object} newModelCounterparts - model counterparts
 * @param {string} answers - answers from the user
 * @param {Array} actions - array of actions
 */
const getModelActions = (
  baseGeneratorPath,
  newModelCounterparts,
  answers,
  actions,
) => {
  const componentPath = `${baseGeneratorPath}/models/{{ ${newModelCounterparts.modelName} }}s`;
  const actualComponentPath = `${baseGeneratorPath}/models/${answers.modelName}s`;

  if (pathExists(actualComponentPath)) {
    throw new Error(`Model '${answers.modelName}s' already exists`);
  }

  // To model schema methods and statics
  const modelActions = getModelActionsConfig(componentPath, baseGeneratorPath);
  actions.push(...modelActions);

  // To route controller validator and tests
  const routeActions = getRouteActionsConfig(baseGeneratorPath, answers);

  if (answers.wantRoute) {
    actions.push(...routeActions);
  }

  actions.push({
    data: {
      path: `${baseGeneratorPath}/routes/${answers.modelName}`,
    },
    type: 'prettify',
  });
};

module.exports = {
  getMigrationActions,
  getModelActions,
  pathExists,
};
