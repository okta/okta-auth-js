module.exports = {
  'extends': [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  'env': {
    'browser': true,
    'node': false
  },
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 2020
  },
  'overrides': [
    {
      'files': [
        '**/*.ts'
      ],
      'plugins': [
        '@typescript-eslint'
      ],
      'parser': '@typescript-eslint/parser',
      'parserOptions': {
        'project': './tsconfig.json',
        'tsconfigRootDir': __dirname,
      }
    },
    {
      'files': [
        '*.js'
      ],
      'rules': {
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/no-var-requires': 0
      }
    }
  ],
  'rules': {
    '@typescript-eslint/no-explicit-any': 0,
    'node/no-unsupported-features/es-syntax': 0,
    'node/no-unsupported-features/node-builtins': 0,
    'node/no-extraneous-require': ['error', {
      'allowModules': [
        '@okta/okta-auth-js'
      ]
    }],
    'semi': 2,
    'eol-last': 2
  }
};
