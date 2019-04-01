var packageJson = require('./package.json');
var OktaAuth = '<rootDir>/' + packageJson.browser;

module.exports = {
  'coverageDirectory': './build2/reports/coverage',
  'restoreMocks': true,
  'moduleNameMapper': {
    '^OktaAuth(.*)$': OktaAuth
  },
  'testMatch': [
    '**/test/spec/*.js'
  ],
  'testPathIgnorePatterns': [
    './test/spec/serverStorage.js'
  ],
  'reporters': [
    'default',
    'jest-junit'
  ]
};
