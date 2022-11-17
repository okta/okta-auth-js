const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:jasmine/recommended'
  ],
  globals: {
    '$': 'readonly',
    'browser': 'readonly',
    'process': 'readonly',
    '__dirname': 'readonly'
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020
  },
  plugins: ['jasmine'],
  env: {
    jasmine: true
  },
  rules: {
    'node/no-unsupported-features/node-builtins': 0,
    'max-len': [2, 150],
    'node/no-missing-import': ['error', {
      allowModules: [],
      resolvePaths: [
        `${ROOT_DIR}/samples/test`,
        `${ROOT_DIR}/samples/test/support`,
      ],
      tryExtensions: ['.js', '.ts']
    }],
    'jsdoc/newline-after-description': 0,
    'jsdoc/check-types': 0,
    'jsdoc/valid-types': 0,
    'jsdoc/check-alignment': 0,
    'node/no-unsupported-features/es-syntax': 0,
    'jasmine/no-suite-dupes': [1, 'branch']
  }
};
