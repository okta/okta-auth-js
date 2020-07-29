// This is the base webpack config that other configs build upon
var webpack = require('webpack');
var SDK_VERSION = require('./package.json').version;

var babelOptions = {
  presets: ['@babel/preset-env'],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime'
  ],
  sourceType: 'unambiguous'
};

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: babelOptions
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
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
    extensions: ['.js', '.ts']
  },
  plugins: [
    new webpack.DefinePlugin({
      SDK_VERSION: JSON.stringify(SDK_VERSION)
    })
  ]
};
