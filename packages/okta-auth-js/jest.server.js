var packageJson = require('./package.json');
var OktaAuth = '<rootDir>/' + packageJson.main;

module.exports = {
  'coverageDirectory': '<rootDir>/build2/reports/coverage',
  'restoreMocks': true,
  'moduleNameMapper': {
    '^OktaAuth(.*)$': OktaAuth
  },
  'testMatch': [
    '**/test/spec/*.js'
  ],
  'testPathIgnorePatterns': [
    './test/spec/browser.js',
    './test/spec/fingerprint.js',
    './test/spec/general.js',
    './test/spec/oauthUtil.js',
    './test/spec/token.js',
    './test/spec/tokenManager.js',
    './test/spec/webfinger.js',
    './test/spec/pkce.js',
    './test/spec/features.js'
  ],
  'reporters': [
    'default',
    'jest-junit'
  ]
};
