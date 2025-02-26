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
    'myaccount/password'
  ]),
  transformIgnorePatterns: [
    'node_modules/(?!(data-uri-to-buffer|formdata-polyfill|fetch-blob|node-fetch)/)',
  ],
  // integration tests need to make network request 
  // extend timeout to 10s for
  testTimeout: 15 * 1000 
});

if (process.env.USE_DPOP == '1') {
  config.setupFiles.unshift('fake-indexeddb/auto');
  config.testEnvironment = 'jsdom';
  config.moduleNameMapper = Object.assign({}, baseConfig.moduleNameMapper, {
    '^./node$': './browser'
  });
  config.testPathIgnorePatterns.push('renewTokens');
}
else {
  config.setupFiles.push('<rootDir>/test/support/jest/jest.setup.node.js');
}

module.exports = config;
