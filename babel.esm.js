const sdkVersion = require('./package.json').version;
module.exports = {
  sourceMaps: true,
  'presets': [
    '@babel/typescript',
    [
      '@babel/preset-env', {
      'targets': {
        'esmodules': true
      },
      'modules': false
    }
  ]],
  'plugins': [
    '@babel/plugin-transform-typescript',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime',
    ['inline-replace-variables', {
      'SDK_VERSION': sdkVersion
    }]
  ]
};