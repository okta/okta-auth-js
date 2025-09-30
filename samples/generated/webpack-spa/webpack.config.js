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


const path = require('path');
const PORT = process.env.PORT || 8080;
const SIW_DIR = path.resolve(require.resolve('@okta/okta-signin-widget'), '..', '..');

const babelOptions = {
  presets: ['@babel/env'],
  plugins: ['@babel/plugin-transform-runtime'],
  sourceType: 'unambiguous'
};

// preserves query parameters
function redirectToOrigin(req, res, next) {
  req.url = '/';
  next();
}

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'app-bundle.js',
    publicPath: '/'
  },
  devServer: {
    static: [
      path.join(__dirname, 'public'),
      SIW_DIR
    ],
    port: PORT,
    // onBeforeSetupMiddleware: function(devServer) {
    //   devServer.app.get('/login/callback', redirectToOrigin);
    //   devServer.app.get('/login', redirectToOrigin);
    //   devServer.app.get('/profile', redirectToOrigin);
    // },
    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.get('/login/callback', redirectToOrigin);
      devServer.app.get('/login', redirectToOrigin);
      devServer.app.get('/profile', redirectToOrigin);

      return middlewares;
    }
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
      }
    ]
  }
};
