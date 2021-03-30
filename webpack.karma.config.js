/*!
 * Copyright (c) 2019-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

var path = require('path');

var _ = require('lodash');
var commonConfig = require('./webpack.common.config');
var babelOptions = {
  presets: [
    '@babel/preset-env'
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime',
    'mockable-imports'
  ],
  sourceType: 'unambiguous'
};

var webpackConf =  _.extend({}, _.cloneDeep(commonConfig), {
  devtool: 'inline-source-map',
  mode: 'development',
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
            loader: 'ts-loader',
            options: {
              configFile: require.resolve('./tsconfig.json')
            }
          }
        ]
      },
      {
        test: /\.{js,ts}$/,
        use: {
          loader: 'istanbul-instrumenter-loader',
          options: { esModules: true }
        },
        enforce: 'post',
        include: [
          path.resolve(__dirname, 'lib')
        ]
      }
    ]
  },
  stats: {
    all: true
  },
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      '@okta/test.app': path.join(__dirname, 'test/app'),
      '@okta/okta-auth-js': path.join(__dirname, '/lib'),
      './node$': './browser' // use browser built-in objects and functions
    }
  }
});

module.exports = webpackConf;
