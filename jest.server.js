const SDK_VERSION = require('./package.json').version;
const USER_AGENT = 'okta-auth-js-server/' + SDK_VERSION;
const baseConfig = require('./test/support/jest/jest.config');
const config = Object.assign({}, baseConfig, {
  testEnvironment: 'node',
  setupFiles: baseConfig.setupFiles.concat([
    '<rootDir>/test/support/jest/jest.setup.server.js'
  ]),
  globals: Object.assign({}, baseConfig.globals, {
    USER_AGENT
  }),
  testPathIgnorePatterns: baseConfig.testPathIgnorePatterns.concat([
    'browserStorage',
    'fingerprint',
    'renewToken',
    'session',
    'features/browser',
    'OktaAuth/browser',
    'oidc/util/browser',
    'oidc/util/loginRedirect',
    'oidc/parseFromUrl',
    'oidc/getWithPopup',
    'oidc/getWithRedirect',
    'oidc/getWithoutPrompt',
    'oidc/renewToken.ts',
    'oidc/renewTokens.ts',
    'TokenManager/browser',
    'TokenManager/crossTabs'
  ])
});

module.exports = config;