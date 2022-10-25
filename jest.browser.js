const SDK_VERSION = require('./package.json').version;
const USER_AGENT = 'okta-auth-js/' + SDK_VERSION;
const baseConfig = require('./test/support/jest/jest.config.unit');
const config = Object.assign({}, baseConfig, {
  testEnvironment: 'jsdom',
  globals: Object.assign({}, baseConfig.globals, {
    USER_AGENT
  }),
  testPathIgnorePatterns: baseConfig.testPathIgnorePatterns.concat([
    '<rootDir>/test/spec/serverStorage.js',
    '<rootDir>/test/spec/features/server',
    '<rootDir>/test/spec/oidc/authenticateWithCiba.ts',
    '<rootDir>/test/spec/crypto/jwt.ts'
  ]),
  moduleNameMapper: Object.assign({}, baseConfig.moduleNameMapper, {
    '^./node$': './browser'
  })
});

module.exports = config;
