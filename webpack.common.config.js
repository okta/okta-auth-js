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
if (process.env.NODE_ENV === 'development') {
  // In local development, we would prefer not to include any babel transforms as they make debugging more difficult
  // However, there is an issue with testcafe which requires the optional chaining transform for SIW compatibility
  // https://github.com/DevExpress/testcafe-hammerhead/issues/2714
  babelOptions.plugins = babelOptions.plugins.concat([
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator'
  ]);
} else {
  babelOptions.presets.unshift('@babel/preset-env'); // must run after preset-typescript
  babelOptions.plugins = babelOptions.plugins.concat([
    '@babel/plugin-transform-runtime'
  ]);
}

// oblivious-set is dependency of broadcast-channel and as of v1.4.0 uses es6 class syntax, which needs to be transpiled
// https://github.com/pubkey/broadcast-channel/commit/190aeac0c6c20ad960131f66ba53c7a8af4535e9#diff-215536be822837c5fa02bf4c92ff56c279505685a6a1c5bc10807ee1acda37fcL1652
var babelExclude = /node_modules\/(?!(p-cancelable|oblivious-set)\/)/;

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
      './node$': './browser', // use browser built-in objects and functions,
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      SDK_VERSION: JSON.stringify(SDK_VERSION)
    })
  ]
};
