/*
 * This config builds a minified version that can be imported
 * anywhere without any dependencies. It packages the SDK
 * with reqwest and Q. It also preserves license comments.
 */

var path    = require('path');
var webpack = require('webpack');
var packageJson = require('./package.json');

var oktaAuthConfig = packageJson['okta-auth-js'];

module.exports = {
  entry: './test/main.js',
  output: {
    path: path.join(__dirname, 'dist', 'test'),
    filename: 'tests.js',
  },
  resolve: {
    alias: {
      'OktaAuth$': path.join(__dirname, 'dist', 'browser', 'OktaAuthRequireJquery.js')
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      SDK_VERSION: JSON.stringify(packageJson.version)
    })
  ]
};
