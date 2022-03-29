module.exports = {
  root: true,
  settings: {
    react: {
      pragma: 'React',
      version: '17.0.2'
    }
  },
  env: {
    browser: true
  },
  globals: {
    process: 'readonly'
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020
  },
  plugins: [
    'react',
    'react-hooks'
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    'react/react-in-jsx-scope': 0,
    'react/prop-types': 0
  }
};
