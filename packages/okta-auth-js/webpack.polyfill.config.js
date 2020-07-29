/* global __dirname */
var path    = require('path');
var _ = require('lodash');
var commonConfig = require('./webpack.common.config');
var webpack = require('webpack');
var fs      = require('fs');
var TerserPlugin = require('terser-webpack-plugin');

var license = fs.readFileSync('lib/license-header.txt', 'utf8');

module.exports = _.extend({}, _.cloneDeep(commonConfig), {
  entry: './polyfill/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'okta-auth-js.polyfill.js',
    library: 'OktaAuthPolyfill',
    libraryTarget: 'umd',
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true, // Must be set to true if using source-maps in production
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
        },
      }),
    ],
  },
  plugins: commonConfig.plugins.concat([
    // Add a single Okta license after removing others
    new webpack.BannerPlugin(license),
  ]),
  devtool: 'source-map',
});
