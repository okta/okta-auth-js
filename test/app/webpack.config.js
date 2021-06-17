/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


require('@okta/env').setEnvironmentVarsFromTestEnv(); // Set environment variables from "testenv" file

const path = require('path');
const webpack = require('webpack');
const PORT = process.env.PORT || 8080;

const babelOptions = {
  presets: ['@babel/env'],
  plugins: ['@babel/plugin-transform-runtime'],
  sourceType: 'unambiguous'
};

module.exports = {
  mode: 'development',
  entry: './src/webpackEntry.ts',
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
      },
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
    extensions: ['.js', '.ts'],
    alias: {
      '@okta/okta-auth-js': path.join(__dirname, '..', '..', 'build')
    }
  }
};
