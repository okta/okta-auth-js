/*
 * This config builds tests against the jQuery version of the module
 */

var path    = require('path');
var webpack = require('webpack');
var _ = require('lodash');
var commonConfig = require('./webpack.common.config');

module.exports = _.extend(commonConfig, {
  entry: './test/main.js',
  output: {
    path: path.join(__dirname, 'dist', 'test'),
    filename: 'tests.js',
  },
  resolve: {
    alias: {
      'OktaAuth$': path.join(__dirname, 'dist', 'browser', 'OktaAuthRequireJquery.js')
    }
  }
});
