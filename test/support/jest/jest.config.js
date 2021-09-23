/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


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
    // '**/test/spec/idx/.{js,ts}'
  ],
  'roots': [
    'test/spec'
  ],
  'testPathIgnorePatterns': [],
  'reporters': [
    'default',
    'jest-junit'
  ]
};
