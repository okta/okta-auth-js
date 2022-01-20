module.exports = {
  env: {
    browser: false,
    node: true
  },
  ignorePatterns: ['assets/js/*.js'],
  overrides: [{
    files: ['public/*.js'],
    rules: {
      'node/no-unsupported-features/node-builtins': 0
    },
    env: {
      browser: true,
      node: false
    }
  }]
};
