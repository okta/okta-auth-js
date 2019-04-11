/* global process, __dirname */
require('dotenv').config();

var webpack = require('webpack');
var path = require('path');

var PORT = process.env.PORT || 8080;

module.exports = {
  mode: 'development',
  plugins: [
    new webpack.EnvironmentPlugin(['CLIENT_ID', 'DOMAIN']),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    port: PORT,
  },
};
