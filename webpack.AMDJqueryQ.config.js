/*
 * This config builds an amd version that requires 
 * jquery and Q are passed as dependencies.
 */

 var path    = require('path');
var webpack = require('webpack');

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
      SDK_VERSION: JSON.stringify(require('./package.json').version)
    })
  ]
};
