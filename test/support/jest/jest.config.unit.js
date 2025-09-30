const baseConfig = require('./jest.config');
const config = Object.assign({}, baseConfig, {
  'roots': [
    'test/spec'
  ],
  'testMatch': [
    '**/test/spec/**/*.{js,ts}'
  ],
  'setupFiles': [
    '<rootDir>/test/support/nodeExceptions.js',
    '<rootDir>/test/support/disableFetch.js',
    '<rootDir>/test/support/jest/jest.setup.js'
  ],
  'transform': {
    '^.+\\.(js)$': 'babel-jest',
    '^.+\\.(ts|html)$': [
      'ts-jest',
      {
        // ts-jest options
        'tsconfig': '<rootDir>/test/spec/tsconfig.spec.json'
      }
    ]
  },
});



module.exports = config;