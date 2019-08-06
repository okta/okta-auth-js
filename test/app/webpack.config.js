/* global process, __dirname */
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Read environment variables from "testenv". Override environment vars if they are already set.
const envConfig = dotenv.parse(fs.readFileSync(path.resolve(__dirname, '../..', 'testenv')));
Object.keys(envConfig).forEach((k) => {
  process.env[k] = envConfig[k];
});

var webpack = require('webpack');
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
    new webpack.EnvironmentPlugin(['CLIENT_ID', 'ISSUER']),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    port: PORT,
  },
};
