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

var entries = {
  'okta-auth-js.min': './lib/exports/cdn/default.ts',
  'okta-auth-js.core.min': './lib/exports/cdn/core.ts',
  'okta-auth-js.authn.min': './lib/exports/cdn/authn.ts',
  'okta-auth-js.idx-minimal.min': './lib/exports/cdn/idx-minimal.ts',
  'okta-auth-js.idx.min': './lib/exports/cdn/idx.ts',
  'okta-auth-js.myaccount.min': './lib/exports/cdn/myaccount.ts'
};

// if ENTRY env var is passed, filter the entries to include only the named ENTRY
if (process.env.ENTRY) {
  entries = {
    [process.env.ENTRY]: entries[process.env.ENTRY]
  };
}

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

module.exports = Object.keys(entries).map(function(entryName) {
  const entry = entries[entryName];
  const config = _.extend({}, baseConfig, {
    mode: (process.env.NODE_ENV === 'development') ? 'development' : 'production',
    entry,
    output: {
      path: path.join(__dirname, 'build', 'dist'),
      filename: `${entryName}.js`,
      library: 'OktaAuth',
      libraryTarget: 'var'
    },
    plugins: [
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        reportFilename: `${entryName}.analyzer.html`,
        analyzerMode: 'static',
        defaultSizes: 'stat'
      })
    ].concat(commonConfig.plugins).concat([

      // Add a single Okta license after removing others
      new webpack.BannerPlugin(license)
    ]),
    devtool: 'source-map'
  });
  return config;
});
