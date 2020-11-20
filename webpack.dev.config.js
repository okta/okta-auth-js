/*
 * This config builds a minified version that can be imported
 * anywhere without any dependencies. It also preserves license comments.
 */
var path    = require('path');
var _ = require('lodash');
var commonConfig = require('./webpack.common.config');

module.exports = _.extend({}, _.cloneDeep(commonConfig), {
  mode: 'development',
  entry: './lib/browser/',
  output: {
    path: path.join(__dirname, 'build', 'dist'),
    filename: 'okta-auth-js.umd.js',
    library: 'OktaAuth',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  devtool: 'source-map',
  watch: true,
});
