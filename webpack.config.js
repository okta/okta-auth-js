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

var entries = {
  'okta-auth-js': './lib/index.ts',
  'core': './lib/core/index.ts',
  'authn': './lib/authn/index.ts',
  'myaccount': './lib/myaccount/index.ts'
};



// if ENTRY env var is passed, filter the entries to include only the named ENTRY
if (process.env.ENTRY) {
  entries = {
    [process.env.ENTRY]: entries[process.env.ENTRY]
  };
}

module.exports = Object.keys(entries).map(function(entryName) {

  var plugins = commonConfig.plugins.concat([
    // Add a single Okta license after removing others
    new webpack.BannerPlugin(license),
  ]);

  // if ANALZYE env var is passed, output analyzer html
  if (process.env.ANALYZE) {
    plugins.unshift(
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        reportFilename: `${entryName}.umd.analyzer.html`,
        analyzerMode: 'static',
        defaultSizes: 'stat'
      })
    );
  }

  return _.extend({}, _.cloneDeep(commonConfig), {
    mode: (process.env.NODE_ENV === 'development') ? 'development' : 'production',
    entry: {
      [entryName]: entries[entryName]
    },
    output: {
      path: path.join(__dirname, 'build', 'dist'),
      filename: '[name].umd.js',
      library: 'OktaAuth',
      libraryTarget: 'umd'
    },
    plugins,
    devtool: 'source-map'
  });
});
