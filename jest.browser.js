var OktaAuth = '<rootDir>/lib/browser';
var SDK_VERSION = require('./package.json').version;

module.exports = {
  'coverageDirectory': '<rootDir>/build2/reports/coverage-browser',
  'collectCoverage': true,
  'collectCoverageFrom': ['./lib/**','!./test/**'],
  'globals': {
    SDK_VERSION: SDK_VERSION
  },
  'restoreMocks': true,
  'moduleNameMapper': {
    '^@okta/okta-auth-js$': OktaAuth
  },
  'setupFiles': [
    '<rootDir>/test/support/nodeExceptions.js'
  ],
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
