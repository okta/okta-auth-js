/* eslint-disable no-console */

require('./env'); // update environment variables from testenv file

const OktaAuthJS = require('../../dist/lib/server');

const util = require('./src/util');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const config = require('./webpack.config.js');
const compiler = webpack(config);

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
}));

app.use(express.static('./public'));

app.use(express.urlencoded());
app.post('/login', function(req, res) {
  const issuer = req.body.issuer;
  const username = req.body.username;
  const password = req.body.password;
  let status = '';
  let sessionToken = '';
  let error = '';
  let authClient;

  try {
    authClient = new OktaAuthJS({
      issuer
    });
  } catch(e) {
    console.error('Caught exception in OktaAuthJS constructor: ', e);
  }

  authClient.signIn({
    username,
    password
  })
  .then(function(transaction) {
    status = transaction.status;
    sessionToken = transaction.sessionToken;
  })
  .catch(function(err) {
    error = err;
    console.error(error);
  })
  .finally(function() {
    const qs = util.toQueryParams({
      status,
      sessionToken,
      error
    });
    res.redirect('/server' + qs);
  });
});

const port = config.devServer.port;
app.listen(port, function () {
  console.log(`Test app running at http://localhost/${port}!\n`);
});
