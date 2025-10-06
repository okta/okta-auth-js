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


require('@okta/env').setEnvironmentVarsFromTestEnv(__dirname);

const path = require('path');
const webpack = require('webpack');
const PORT = process.env.PORT || 8080;

const babelOptions = {
  presets: [
    '@babel/env',
    '@babel/preset-typescript'
  ],
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
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      // dev build of the widget
      // '@okta/okta-signin-widget': '@okta/okta-signin-widget/dist/js/okta-sign-in.js',

      // local dev build of the widget
      // '@okta/okta-signin-widget': '@okta/okta-signin-widget/target/js/okta-sign-in.js'
    }
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      CLIENT_ID: '',
      ISSUER: '',
      CLIENT_SECRET: ''
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    port: PORT,
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.[jt]s$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      },
      {
        test: /\.[jt]s$/,
        exclude:/node_modules\/(?!p-cancelable)/,
        loader: 'babel-loader',
        options: babelOptions
      }
    ],
  },
  ignoreWarnings: [/Failed to parse source map/]
};
