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
var baseConfig = _.cloneDeep(commonConfig);
var babelOptions = _.find(baseConfig.module.rules, (rule) => rule.loader === 'babel-loader').options;
var extraBabelPlugins = [
  ['@babel/plugin-transform-modules-commonjs', {
    'strict': true,
    'noInterop': false
  }],
  'add-module-exports' // converts export.default into module.exports
];
babelOptions.plugins = babelOptions.plugins.concat(extraBabelPlugins);

module.exports = _.extend({}, baseConfig, {
  mode: 'production',
  entry: './lib/browser/browser', // only export OktaAuth constructor
  output: {
    path: path.join(__dirname, 'build', 'dist'),
    filename: 'okta-auth-js.min.js',
    library: 'OktaAuth',
    libraryTarget: 'var'
  },
  plugins: commonConfig.plugins.concat([

    // Add a single Okta license after removing others
    new webpack.BannerPlugin(license)
  ]),
  devtool: 'source-map'
});
