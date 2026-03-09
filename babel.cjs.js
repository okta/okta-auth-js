const sdkVersion = require('./package.json').version;
module.exports = {
  sourceMaps: true,
  'presets': [
    '@babel/typescript',
    [
      '@babel/preset-env', {
      'targets': {
        'node': true
      },
      'modules': 'commonjs'
    }
  ]],
  'plugins': [
    '@babel/plugin-transform-typescript',
    // https://babeljs.io/docs/en/babel-plugin-transform-runtime#corejs
    '@babel/plugin-transform-runtime',
    ['@babel/plugin-transform-modules-commonjs', {
      'strict': true,
      'noInterop': false
    }],
    'add-module-exports',
    ['inline-replace-variables', {
      'SDK_VERSION': sdkVersion
    }]
  ]
};