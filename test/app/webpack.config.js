require('./env'); // update environment variables from testenv file

const path = require('path');
var webpack = require('webpack');
var PORT = process.env.PORT || 8080;

module.exports = {
  mode: 'development',
  entry: './src/webpackEntry.js',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'oidc-app.js',
    publicPath: '/'
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
  },
  resolve: {
    alias: {
      '@okta/okta-auth-js': path.join(__dirname, '..', '..', 'dist')
    }
  }
};
