/* global process, __dirname */
require('dotenv').config();

var webpack = require('webpack');
var path = require('path');
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const PACKAGE_JSON = require(path.join(ROOT_DIR, 'package.json'));
const MAIN_ENTRY = path.resolve(ROOT_DIR, PACKAGE_JSON.browser);

var PORT = process.env.PORT || 8080;

module.exports = {
  mode: 'development',
  resolve: {
    alias: {
      '@okta/okta-auth-js': MAIN_ENTRY
    }
  },
  plugins: [
    new webpack.EnvironmentPlugin(['CLIENT_ID', 'DOMAIN']),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    port: PORT,
  },
};
