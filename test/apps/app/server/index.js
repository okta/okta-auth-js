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


/* eslint-disable no-console */

require('@okta/env').setEnvironmentVarsFromTestEnv(__dirname);

if (!!process.env.DEBUG) {
  // do nothing
}
else {
  console.log = (()=>{});
  console.error = (()=>{});
}

const createProxyMiddleware = require('./proxyMiddleware');
const loginMiddleware = require('./loginMiddleware');
const callbackMiddleware = require('./callbackMiddleware');
const renderWidget = require('./renderWidget');

const path = require('path');
const SIW_DIST = path.resolve(path.dirname(require.resolve('@okta/okta-signin-widget')), '..');
const AUTH_JS_DIST = path.resolve(path.dirname(require.resolve('@okta/okta-auth-js/package.json')), 'build', 'dist');

const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const config = require('../webpack.config.js');
const compiler = webpack(config);

// Set a proxy in front of Okta
const proxyMiddleware = createProxyMiddleware();
app.use('/oauth2', proxyMiddleware);
app.use('/app', proxyMiddleware);

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath
}));

app.use(express.static('./public'));
app.use(express.static(AUTH_JS_DIST));
app.use('/siw', express.static(SIW_DIST));

app.use(express.urlencoded({ extended: true }));

app.post('/login', loginMiddleware);
app.get('/login', renderWidget);
app.get('/authorization-code/callback', callbackMiddleware);

const port = config.devServer.port;
app.listen(port, function () {
  console.log(`Test app running at http://localhost:${port}!\n`);
});
