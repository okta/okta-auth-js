/*
 * This config builds an amd version that requires 
 * jquery and Q are passed as dependencies.
 */

var path    = require('path');
var webpack = require('webpack');
var _ = require('lodash');
var commonConfig = require('./webpack.common.config');

module.exports = _.extend(commonConfig, {
  entry: './jquery/index.js',
  output: {
    path: path.join(__dirname, 'dist', 'browser'),
    filename: 'OktaAuthRequireJquery.js',
    libraryTarget: 'amd'
  },
  externals: [
    'jquery',
    'q'
  ]
});
