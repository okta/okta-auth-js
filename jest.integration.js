require('@okta/env').setEnvironmentVarsFromTestEnv(); // Set environment variables from "testenv" file

const SDK_VERSION = require('./package.json').version;
const USER_AGENT = `okta-auth-js/${SDK_VERSION} nodejs/${process.versions.node}`;
const baseConfig = require('./test/support/jest/jest.config');
const config = Object.assign({}, baseConfig, {
  roots: [
    'test/integration'
  ],
  testMatch: [
    '**/test/integration/spec/**/*.{js,ts}'
  ],
  setupFiles: [
    '<rootDir>/test/support/nodeExceptions.js',
    '<rootDir>/test/support/jest/jest.setup.js',
    '<rootDir>/test/support/jest/jest.setup.node.js'
  ],
  testEnvironment: 'node',
  globals: Object.assign({}, baseConfig.globals, {
    USER_AGENT,
    ISSUER: process.env.ISSUER,
    USERNAME: process.env.USERNAME,
    PASSWORD: process.env.PASSWORD,
  }),
  testPathIgnorePatterns: baseConfig.testPathIgnorePatterns.concat([
    // ingore tests by filename
  ]),
  transformIgnorePatterns: [
    'node_modules/(?!(data-uri-to-buffer|formdata-polyfill|fetch-blob|node-fetch)/)',
  ],
  // integration tests need to make network request 
  // extend timeout to 10s for
  testTimeout: 10 * 1000 
});

module.exports = config;