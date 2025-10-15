const js = require('@eslint/js');
const globals = require('globals');
const jsdoc = require('eslint-plugin-jsdoc');
const mocha = require('eslint-plugin-mocha');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  mocha.configs.flat.recommended,
  jsdoc.configs['flat/recommended'],
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      'import/no-unresolved': 'error', // Error for unresolved imports
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          'newlines-between': 'always',
          alphabetize: { caseInsensitive: true, order: 'asc' },
          pathGroups: [
            {
              group: 'internal',
              pattern: './*',
              patternOptions: { matchBase: true },
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'external'],
          distinctGroup: true,
        },
      ],
      'jsdoc/require-description': 'off', // Disable JSDoc require description
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
        },
      ],
      'no-unused-vars': 'warn',
      'no-undef': 'error', // Show error for undefined variables
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'sort-keys': 'off', // Disable sort keys
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
      ],
      'sort-vars': ['error', { ignoreCase: true }],
      'mocha/no-exclusive-tests': 'error',
      'mocha/no-skipped-tests': 'warn',
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
        ...globals.browser,
      },
    },
  },
  {
    ignores: [
      '**/*.config.js',
      'eslint.config.js',
      'src/controllers/**',
      'build/**/*',
    ],
  },
];
