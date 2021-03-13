/* eslint-disable no-console */

require('@okta/env'); // update environment variables from testenv file

const loginMiddleware = require('./v1/loginMiddleware');
const handleAuthorizationCode = require('./authorizationCodeFlow');
const interactMiddleware = require('./interact');
const handleInteractionCode = require('./interactionCodeFlow');

const path = require('path');
const SIW_DIST = path.resolve(path.dirname(require.resolve('@okta/okta-signin-widget')), '..');

const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const config = require('../webpack.config.js');
const compiler = webpack(config);

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
}));

app.use(express.static('./public'));
app.use(express.static('../../build/dist'));
app.use('/siw', express.static(SIW_DIST));

app.use(express.urlencoded());

// Authn V1
app.post('/login', loginMiddleware);
app.get('/authorization-code/callback', handleAuthorizationCode);

// OIE V2
app.post('/interact', interactMiddleware);
app.get('/interaction-code/callback', handleInteractionCode);

const port = config.devServer.port;
app.listen(port, function () {
  console.log(`Test app running at http://localhost:${port}!\n`);
});
