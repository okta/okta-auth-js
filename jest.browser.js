var OktaAuth = '<rootDir>/lib/browser';
var SDK_VERSION = require('./package.json').version;
var USER_AGENT = 'okta-auth-js/' + SDK_VERSION;

module.exports = {
  'coverageDirectory': '<rootDir>/build2/reports/coverage-browser',
  'collectCoverage': true,
  'collectCoverageFrom': ['./lib/**','!./test/**'],
  'globals': {
    'ts-jest': {
      'tsconfig': '<rootDir>/test/spec/tsconfig.spec.json'
    },
    SDK_VERSION,
    USER_AGENT
  },
  'transform': {
    '^.+\\.(js)$': 'babel-jest',
    '^.+\\.(ts|html)$': 'ts-jest'
  },
  'restoreMocks': true,
  'moduleNameMapper': {
    '^@okta/okta-auth-js$': OktaAuth
  },
  'setupFiles': [
    '<rootDir>/test/support/nodeExceptions.js',
    '<rootDir>/jest.setup.js'
  ],
  'testMatch': [
    '**/test/spec/**/*.{js,ts}'
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
