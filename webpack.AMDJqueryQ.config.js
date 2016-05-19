/*
 * This config builds an amd version that requires 
 * jquery and Q are passed as dependencies.
 */

var path    = require('path');
var webpack = require('webpack');
var packageJson = require('./package.json');

var oktaAuthConfig = packageJson['okta-auth-js'];

module.exports = {
  entry: './lib/index.js',
  output: {
    path: path.join(__dirname, 'dist', 'browser'),
    filename: 'OktaAuthRequireJquery.js',
    libraryTarget: 'amd'
  },
  externals: [
    'jquery',
    'q'
  ],
  resolve: {
    alias: {
      'ajaxRequest': './jqueryRequest'
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      SDK_VERSION: JSON.stringify(packageJson.version),
      STATE_TOKEN_COOKIE_NAME: JSON.stringify(oktaAuthConfig.STATE_TOKEN_COOKIE_NAME)
    })
  ]
};
