module.exports = {
  'env': {
    'browser': true
  },
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 2020
  },
  'rules': {
    'node/no-extraneous-import': ['error', {
      'allowModules': [
        '@okta/okta-auth-js',
        '@okta/env'
      ]
    }]
  }
};
