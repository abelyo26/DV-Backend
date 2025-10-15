const inquirerDirectory = require('inquirer-directory');
const shell = require('shelljs');

const { fileGenerator } = require('./index');

/**
 * Plop configuration
 * @param {object} plop - plop object
 */
module.exports = function (plop) {
  plop.setPrompt('directory', inquirerDirectory);
  plop.setGenerator('model', fileGenerator);

  plop.setActionType('prettify', (answers, config) => {
    const { data } = config;
    shell.exec(`yarn run prettify -- "${data.path}"`, { silent: true });

    return '';
  });
};
