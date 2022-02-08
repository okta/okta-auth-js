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
      'modules': false
    }
  ]],
  'plugins': [
    '@babel/plugin-transform-typescript',
    '@babel/plugin-proposal-class-properties',
    ['@babel/plugin-transform-runtime', {
      corejs: 3
    }],
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