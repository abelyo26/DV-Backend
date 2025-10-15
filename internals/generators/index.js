const { inquirerPrompts } = require('./constants');
const { baseGeneratorPath } = require('./path');
const { getMigrationActions, getModelActions } = require('./utils');

const newModelCounterparts = {
  modelName: 'modelName',
  wantRoute: 'wantRoute',
};

const typeGeneration = {
  Migration: 'Migration',
  Model: 'Model',
};

const fileGenerator = {
  /**
   * actions to be performed
   * @param {object} data - data from the prompt
   * @returns {Array} - array of actions
   */
  actions: (data) => {
    const answers = data;
    const actions = [];

    if (answers.modelType === typeGeneration.Migration) {
      getMigrationActions(baseGeneratorPath, answers, actions);
    } else if (answers.modelType === typeGeneration.Model) {
      getModelActions(
        baseGeneratorPath,
        newModelCounterparts,
        answers,
        actions,
      );
    }

    return actions;
  },

  description: 'Add a Model',

  prompts: inquirerPrompts(newModelCounterparts, typeGeneration),
};

module.exports = { fileGenerator };
