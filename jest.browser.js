var OktaAuth = '<rootDir>/lib/browser/browserIndex.js';
var SDK_VERSION = require('./package.json').version;

module.exports = {
  'coverageDirectory': '<rootDir>/build2/reports/coverage',
  'globals': {
    SDK_VERSION: SDK_VERSION
  },
  'restoreMocks': true,
  'moduleNameMapper': {
    '^OktaAuth(.*)$': OktaAuth
  },
  'testMatch': [
    '**/test/spec/*.js'
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
