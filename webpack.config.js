/*
 * This config builds a minified version that can be imported
 * anywhere without any dependencies. It also preserves license comments.
 */
var path    = require('path');
var webpack = require('webpack');
var fs      = require('fs');
var _ = require('lodash');
var commonConfig = require('./webpack.common.config');

var license = fs.readFileSync('lib/license-header.txt', 'utf8');

module.exports = _.extend({}, _.cloneDeep(commonConfig), {
  mode: (process.env.NODE_ENV === 'development') ? 'development' : 'production',
  entry: './lib/',
  output: {
    path: path.join(__dirname, 'build', 'dist'),
    filename: 'okta-auth-js.umd.js',
    library: 'OktaAuth',
    libraryTarget: 'umd'
  },
  plugins: commonConfig.plugins.concat([

    // Add a single Okta license after removing others
    new webpack.BannerPlugin(license)
  ]),
  devtool: 'source-map'
});
