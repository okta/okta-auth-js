const SDK_VERSION = require('./package.json').version;
const USER_AGENT = 'okta-auth-js/' + SDK_VERSION;
const baseConfig = require('@okta/test.support/jest/jest.config.unit');
const config = Object.assign({}, baseConfig, {
  testEnvironment: 'jsdom',
  globals: Object.assign({}, baseConfig.globals, {
    USER_AGENT
  }),
  testPathIgnorePatterns: baseConfig.testPathIgnorePatterns.concat([
    '<rootDir>/test/spec/serverStorage.js',
    '<rootDir>/test/spec/features/server'
  ]),
  moduleNameMapper: Object.assign({}, baseConfig.moduleNameMapper, {
    '^./node$': './browser'
  })
});

module.exports = config;
