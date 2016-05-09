/*
 * This config builds a minified version that can be imported
 * anywhere without any dependencies. It packages the SDK
 * with reqwest and Q. It also preserves license comments.
 */

var path    = require('path');
var webpack = require('webpack');
var fs      = require('fs');

var license = fs.readFileSync('lib/license-header.txt', 'utf8');

module.exports = {
  entry: './lib/index.js',
  output: {
    path: path.join(__dirname, 'dist', 'browser'),
    filename: 'OktaAuth.min.js',
    library: 'OktaAuth',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    alias: {
      'ajaxRequest': './reqwestRequest'
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      SDK_VERSION: JSON.stringify(require('./package.json').version)
    }),

    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: false,
      comments: function(node, comment) {
        // Remove other Okta copyrights
        var isLicense = /^!/.test(comment.value);
        var isOkta = /.*Okta.*/.test(comment.value);
        return isLicense && !isOkta;
      }
    }),

    // Add a single Okta license after removing others
    new webpack.BannerPlugin(license)
  ]
};
