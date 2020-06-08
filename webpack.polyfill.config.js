var path    = require('path');
var _ = require('lodash');
var commonConfig = require('./webpack.common.config');
var webpack = require('webpack');
var fs      = require('fs');

var license = fs.readFileSync('lib/license-header.txt', 'utf8');

module.exports = _.extend({}, _.cloneDeep(commonConfig), {
  entry: './polyfill/index.js',
  output: {
    path: path.join(__dirname, 'dist', 'bundles'),
    filename: 'okta-auth-js.polyfill.js',
    library: 'OktaAuthPolyfill',
    libraryTarget: 'umd'
  },
  plugins: commonConfig.plugins.concat([
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: true,
      comments: function(node, comment) {
        // Remove other Okta copyrights
        var isLicense = /^!/.test(comment.value);
        var isOkta = /.*Okta.*/.test(comment.value);
        return isLicense && !isOkta;
      }
    }),
    
    // Add a single Okta license after removing others
    new webpack.BannerPlugin(license)
  ]),
  devtool: 'source-map'
});
