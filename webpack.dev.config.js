/*
 * This config builds a minified version that can be imported
 * anywhere without any dependencies. It also preserves license comments.
 */
var path    = require('path');
var _ = require('lodash');
var commonConfig = require('./webpack.common.config');

module.exports = _.extend({}, _.cloneDeep(commonConfig), {
  entry: './lib/browser/browserIndex.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'okta-auth-js.min.js',
    library: 'OktaAuth',
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
  watch: true
});
