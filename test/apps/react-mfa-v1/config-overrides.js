const webpack = require('webpack');

const envModule = require('@okta/test.support/env');
envModule.setEnvironmentVarsFromTestEnv(__dirname);

const env = {};
// List of environment variables made available to the app
['ISSUER', 'CLIENT_ID'].forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} must be set. See README.md`);
  }
  env[key] = JSON.stringify(process.env[key]);
});

module.exports = {
  webpack: (config) => {
    // Remove the 'ModuleScopePlugin' which keeps us from requiring outside the src/ dir
    config.resolve.plugins = [];

    // Define global vars from env vars (process.env has already been defined)
    config.plugins = config.plugins.concat([
      new webpack.DefinePlugin({
        'process.env': env,
      }),
    ]);

    config.devtool = 'source-map';
    config.module.rules.push({
      test: /\.js$/,
      use: ['source-map-loader'],
      enforce: 'pre',
    });

    return config;
  }
}
