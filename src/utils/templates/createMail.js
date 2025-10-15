import fs from 'fs';
import path from 'path';

import handlebars from 'handlebars';

/**
 * Create mail
 * @param {object} options - options
 * @param {string} options.title - email title
 * @param {string} options.description - email description
 * @param {string} options.link - email link
 * @param {string} options.linkLabel - email link label
 * @returns {string} - parsed html
 */
const createMailTemplate = ({ data, templateFileName = 'defaultTemplate' }) => {
  try {
    const html = fs.readFileSync(
      path.resolve(__dirname, `./${templateFileName}.html`),
      { encoding: 'utf-8' },
    );

    const template = handlebars.compile(html);

    const parsedHtml = template(data);

    return parsedHtml;
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    // return `<h1>${title}</h1><p>${description}</p><a href="${link}">${linkLabel}</a>`;
    console.error('Error creating mail template', error);
  }
};

export default createMailTemplate;
