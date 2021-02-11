/* eslint-disable no-console */

require('@okta/env'); // update environment variables from testenv file

// eslint-disable-next-line node/no-unpublished-require
const OktaAuthJS = require('../../build/cjs/server').OktaAuth;

const path = require('path');
const SIW_DIST = path.resolve(path.dirname(require.resolve('@okta/okta-signin-widget')), '..');

const util = require('./src/util');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const querystring = require('querystring');

const app = express();
const config = require('./webpack.config.js');
const compiler = webpack(config);

const http = require('http');
const https = require('https');
const btoa = require('btoa');

// converts a standard base64-encoded string to a "url/filename safe" variant
function base64ToBase64Url(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// converts a string to base64 (url/filename safe variant)
function stringToBase64Url(str) {
  const b64 = btoa(str);
  return base64ToBase64Url(b64);
}

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
}));

app.use(express.static('./public'));
app.use(express.static('../../build/dist'));
app.use('/siw', express.static(SIW_DIST));

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
    const qs = util.toQueryString({
      status,
      sessionToken,
      error
    });
    res.redirect('/server' + qs);
  });
});

// The request query should contain a code and state, or an error and error_description.
function handleAuthorizationCode(req, res) {
  const error = req.query.error;
  if (error) {
    res.send(`
      <html>
        <body>
          <h1>${error}</h1>
          <p>
          ${req.query.error_description}
          </p>
        </body>
      </html>
    `);
    return;
  }
  // also known as "authorization_code"
  const code = req.query.code;

  // state can be any string. In this sample are using it to store our config
  const state = JSON.parse(req.query.state);
  const { issuer, clientId, _clientSecret, redirectUri } = state;

  console.log('STATE', state);
  const postData = querystring.stringify({
    'grant_type': 'authorization_code',
    'redirect_uri': redirectUri,
    'code': code
  });
  const isHttp = new URL(issuer).protocol === 'http:';
  const httpRequestor = isHttp ? http : https;
  const baseUrl = issuer.indexOf('/oauth2') > 0 ? issuer : `${issuer}/oauth2`;
  const encodedSecret = stringToBase64Url(`${clientId}:${_clientSecret}`);
  const post = httpRequestor.request(`${baseUrl}/v1/token`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'authorization': `Basic ${encodedSecret}`,
      'content-type': 'application/x-www-form-urlencoded',
    }
  }, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      res.send(`
        <html>
          <body>
            <code id="oidcResult">${data}</code>
          </body>
        </html>
      `);
    });

  }).on('error', (err) => {
    console.log('Error: ' + err.message);
    res.send(`
    <html>
      <body>
        <h1>${err.message}</h1>
        <p>
        ${error.toString()}
        </p>
      </body>
    </html>
  `);
  });

  post.write(postData);
  post.end();
}

app.get('/authorization-code/callback', handleAuthorizationCode);

const port = config.devServer.port;
app.listen(port, function () {
  console.log(`Test app running at http://localhost:${port}!\n`);
});
