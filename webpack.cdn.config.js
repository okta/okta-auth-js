/*
 * This config builds a minified version that can be imported
 * anywhere without any dependencies. It also preserves license comments.
 */
var path    = require('path');
var webpack = require('webpack');
var fs      = require('fs');
var _ = require('lodash');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

var commonConfig = require('./webpack.common.config');

var license = fs.readFileSync('lib/license-header.txt', 'utf8');
var baseConfig = _.cloneDeep(commonConfig);

var extraBabelPlugins = [
  ['@babel/plugin-transform-modules-commonjs', {
    'strict': true,
    'noInterop': false
  }],
  'add-module-exports' // converts export.default into module.exports
];

function addBabelPlugins(rule) {
  if (rule.use) {
    rule.use.forEach(addBabelPlugins);
    return;
  }

  if (rule.loader === 'babel-loader' && rule.options) {
    rule.options = _.cloneDeep(rule.options);
    rule.options.plugins = rule.options.plugins.concat(extraBabelPlugins);
  }
}

baseConfig.module.rules.forEach(addBabelPlugins);

module.exports = _.extend({}, baseConfig, {
  mode: (process.env.NODE_ENV === 'development') ? 'development' : 'production',
  entry: './lib/cdnEntry.ts', // only export OktaAuth constructor
  output: {
    path: path.join(__dirname, 'build', 'dist'),
    filename: 'okta-auth-js.min.js',
    library: 'OktaAuth',
    libraryTarget: 'var'
  },
  plugins: [
    new BundleAnalyzerPlugin({
      openAnalyzer: false,
      reportFilename: 'okta-auth-js.min.analyzer.html',
      analyzerMode: 'static',
      defaultSizes: 'stat'
    })
  ].concat(commonConfig.plugins).concat([

    // Add a single Okta license after removing others
    new webpack.BannerPlugin(license)
  ]),
  devtool: 'source-map'
});
