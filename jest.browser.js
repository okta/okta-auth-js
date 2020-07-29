var OktaAuth = '<rootDir>/lib/browser';
var SDK_VERSION = require('./package.json').version;

module.exports = {
  'coverageDirectory': '<rootDir>/build2/reports/coverage',
  'globals': {
    SDK_VERSION: SDK_VERSION
  },
  'restoreMocks': true,
  'moduleNameMapper': {
    '^@okta/okta-auth-js$': OktaAuth
  },
  'testMatch': [
    '**/test/spec/*.{js,ts}'
  ],
  'roots': [
    'test/spec'
  ],
  'testPathIgnorePatterns': [
    './test/spec/serverStorage.js'
  ],
  'reporters': [
    'default',
    'jest-junit'
  ]
};
