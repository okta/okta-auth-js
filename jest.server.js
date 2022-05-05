const SDK_VERSION = require('./package.json').version;
const USER_AGENT = `okta-auth-js/${SDK_VERSION} nodejs/${process.versions.node}`;
const baseConfig = require('@okta/test.support/jest/jest.config.unit');
const config = Object.assign({}, baseConfig, {
  testEnvironment: 'node',
  setupFiles: baseConfig.setupFiles.concat([
    '<rootDir>/test/support/jest/jest.setup.node.js'
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
    'SyncStorageService',
    'ServiceManager'
  ])
});

module.exports = config;