var OktaAuth = '<rootDir>/lib';
var SDK_VERSION = require('../../../package.json').version;

module.exports = {
  'coverageDirectory': '<rootDir>/build2/reports/coverage-browser',
  'collectCoverage': true,
  'collectCoverageFrom': ['./lib/**','!./test/**'],
  'globals': {
    'ts-jest': {
      'tsconfig': '<rootDir>/test/spec/tsconfig.spec.json'
    },
    SDK_VERSION
  },
  'transform': {
    '^.+\\.(js)$': 'babel-jest',
    '^.+\\.(ts|html)$': 'ts-jest'
  },
  'restoreMocks': true,
  'moduleNameMapper': {
    '^@okta/okta-auth-js$': OktaAuth,
    '^lib/(.*)$': '<rootDir>/lib/$1'

  },
  'setupFiles': [
    '<rootDir>/test/support/nodeExceptions.js',
    '<rootDir>/test/support/jest/jest.setup.js'
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
