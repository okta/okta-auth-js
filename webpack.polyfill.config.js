var path    = require('path');
var _ = require('lodash');
var commonConfig = require('./webpack.common.config');
var webpack = require('webpack');
var fs      = require('fs');

var license = fs.readFileSync('lib/license-header.txt', 'utf8');

module.exports = _.extend({}, _.cloneDeep(commonConfig), {
  mode: 'production',
  entry: './polyfill/',
  output: {
    path: path.join(__dirname, 'dist', 'bundles'),
    filename: 'okta-auth-js.polyfill.js',
    library: 'OktaAuthPolyfill',
    libraryTarget: 'umd'
  },
  plugins: commonConfig.plugins.concat([
    // Add a single Okta license after removing others
    new webpack.BannerPlugin(license)
  ]),
  devtool: 'source-map'
});
