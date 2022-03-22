// This is the base webpack config that other configs build upon
var webpack = require('webpack');
var SDK_VERSION = require('./package.json').version;

var babelOptions = {
  configFile: false, // do not load from babel.config.js
  babelrc: false, // do not load from .babelrc
  presets: [
    '@babel/preset-typescript'
  ],
  plugins: [],
  sourceType: 'unambiguous',
  // the banners should only be added at the end of the build process
  // ignore all comments during transpiling
  shouldPrintComment: () => false 
};

// Keep source files untransformed for local development
if (process.env.NODE_ENV !== 'development') {
  babelOptions.presets.unshift('@babel/preset-env'); // must run after preset-typescript
  babelOptions.plugins = babelOptions.plugins.concat([
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime'
  ]);
}
var babelExclude = /node_modules\/(?!p-cancelable)/;

module.exports = {
  module: {
    rules: [
      {
        test: /\.[jt]s$/,
        exclude: babelExclude,
        loader: 'babel-loader',
        options: babelOptions
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      './node$': './browser', // use browser built-in objects and functions
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      SDK_VERSION: JSON.stringify(SDK_VERSION)
    })
  ]
};
