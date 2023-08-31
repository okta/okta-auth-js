const SDK_VERSION = require('./package.json').version;
const USER_AGENT = 'okta-auth-js/' + SDK_VERSION;
const baseConfig = require('./test/support/jest/jest.config.unit');
const config = Object.assign({}, baseConfig, {
  testEnvironment: 'jsdom',
  globals: Object.assign({}, baseConfig.globals, {
    USER_AGENT
  }),
  setupFiles: baseConfig.setupFiles.concat([
    'jsdom-worker'
  ]),
  testPathIgnorePatterns: baseConfig.testPathIgnorePatterns.concat([
    '<rootDir>/test/spec/serverStorage.js',
    '<rootDir>/test/spec/features/server'
  ]),
  moduleNameMapper: Object.assign({}, baseConfig.moduleNameMapper, {
    '^./node$': './browser',
    'workers/(.*?).emptyWorker': '<rootDir>/build/esm/browser/workers/$1.worker.js',
  })
});

module.exports = config;
