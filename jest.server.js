var SDK_VERSION = require('./package.json').version;
var USER_AGENT = 'okta-auth-js-server/' + SDK_VERSION;
var OktaAuth = '<rootDir>/lib/server';

module.exports = {
  'coverageDirectory': '<rootDir>/build2/reports/coverage-server',
  'collectCoverage': true,
  'collectCoverageFrom': ['./lib/**','!./test/**'],
  'globals': {
    SDK_VERSION,
    USER_AGENT
  },
  'restoreMocks': true,
  'moduleNameMapper': {
    '^@okta/okta-auth-js$': OktaAuth
  },
  'setupFiles': [
    '<rootDir>/jest.setup.js'
  ],
  'testMatch': [
    '**/test/spec/**/*.{js,ts}'
  ],
  'roots': [
    'test/spec'
  ],
  'testPathIgnorePatterns': [
    './test/spec/oidc',
    './test/spec/promiseQueue.js',
    './test/spec/OktaAuth/browser.ts',
    './test/spec/browserStorage.js',
    './test/spec/cookies.js',
    './test/spec/fingerprint.js',
    './test/spec/oauthUtil.js',
    './test/spec/session.js',
    './test/spec/tokenManager.js',
    './test/spec/webfinger.js',
    './test/spec/features.js',
    './test/spec/AuthStateManager.js'
  ],
  'reporters': [
    'default',
    'jest-junit'
  ]
};
