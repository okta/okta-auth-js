const SDK_VERSION = require('./package.json').version;
const USER_AGENT = 'okta-auth-js/' + SDK_VERSION;
const baseConfig = require('./test/support/jest/jest.config');
const config = Object.assign({}, baseConfig, {
  globals: Object.assign({}, baseConfig.globals, {
    USER_AGENT
  }),
  testPathIgnorePatterns: baseConfig.testPathIgnorePatterns.concat([
    '<rootDir>/test/spec/serverStorage.js',
    '<rootDir>/test/spec/features/server'
  ])
});

module.exports = config;
