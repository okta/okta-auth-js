// This is the base webpack config that other configs build upon
var webpack = require('webpack');
var SDK_VERSION = require('./package.json').version;

var babelOptions = {
  presets: ['@babel/preset-env'],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime'
  ],
  sourceType: 'unambiguous',
  // the banners should only be added at the end of the build process
  // ignore all comments during transpiling
  shouldPrintComment: () => false 
};

var babelExclude = /node_modules\/(?!p-cancelable|node-cache)/;

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: babelExclude,
        loader: 'babel-loader',
        options: babelOptions
      },
      {
        test: /\.ts$/,
        exclude: babelExclude,
        use: [
          {
            loader: 'babel-loader',
            options: babelOptions
          },
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      './node$': './browser', // use browser built-in objects and functions
      'node-cache': false // do not webpack node-only modules
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      SDK_VERSION: JSON.stringify(SDK_VERSION)
    })
  ]
};
