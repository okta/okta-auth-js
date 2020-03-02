/* global process, __dirname */
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const ROOT_DIR = path.resolve(__dirname, '..', '..');

// Read environment variables from "testenv". Override environment vars if they are already set.
const TESTENV = path.resolve(ROOT_DIR, 'testenv');

if (fs.existsSync(TESTENV)) {
  const envConfig = dotenv.parse(fs.readFileSync(TESTENV));
  Object.keys(envConfig).forEach((k) => {
    process.env[k] = envConfig[k];
  });  
}

var webpack = require('webpack');
var PORT = process.env.PORT || 8080;

module.exports = {
  mode: 'development',
  entry: './src/webpackEntry.js',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'oidc-app.js'
  },
  plugins: [
    new webpack.EnvironmentPlugin(['CLIENT_ID', 'ISSUER']),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    port: PORT,
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      }
    ]
  }
};
