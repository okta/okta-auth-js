// @ts-nocheck
/* eslint-disable no-console */

const OktaAuthJS = require('@okta/okta-auth-js').OktaAuth;

const express = require('express');
const querystring = require('querystring');
const uuid = require('uuid');
const https = require('https');
const btoa = require('btoa');

const redirectUrl = `http://localhost:8080/authorization-code/callback`;

// converts a string to base64 (url/filename safe variant)
function stringToBase64Url(str) {
  var b64 = btoa(str);
  return base64ToBase64Url(b64);
}

// converts a standard base64-encoded string to a "url/filename safe" variant
function base64ToBase64Url(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const port = 8080;
const app = express();

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

    const clientId = req.body.clientId;
    const clientSecret = req.body.clientSecret;
    const state = JSON.stringify({
      username,
      issuer,
      clientId,
      clientSecret
    });
    const baseUrl = issuer.indexOf('/oauth2') > 0 ? issuer : `${issuer}/oauth2`;
    const authorizeUrl = `${baseUrl}/v1/authorize?` + querystring.stringify({
      'client_id': clientId,
      'response_type': 'code',
      'scope': 'openid',
      'prompt': 'none',
      'redirect_uri': redirectUrl,
      'state': state,
      'nonce': uuid.v4(),
      'sessionToken': sessionToken
    });
    res.redirect(authorizeUrl);

  })
  .catch(function(err) {
    error = err;

    // Return data to the client-side
    const qs = querystring.stringify({
      username,
      issuer,
      status,
      error: error.toString(),
    });
    res.redirect('/?' + qs);
  });
});

// Handle OIDC callback. The request query will contain a code and state
app.get('/authorization-code/callback', function(req, res) {
  // also known as "authorization_code"
  const code = req.query.code;

  // state can be any string. In this sample are using it to store our config
  const state = JSON.parse(req.query.state);
  const { issuer, clientId, clientSecret } = state;

  const postData = querystring.stringify({
    'grant_type': 'authorization_code',
    'redirect_uri': redirectUrl,
    'code': code
  });
  const baseUrl = issuer.indexOf('/oauth2') > 0 ? issuer : `${issuer}/oauth2`;
  const encodedSecret = stringToBase64Url(`${clientId}:${clientSecret}`);
  const post = https.request(`${baseUrl}/v1/token`, {
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
      const appUri = '/?'  + querystring.stringify(state);

      res.send(`
        <html>
          <body>
            <code id="accessToken">${data}</code>
            <hr/>
            <a href="${appUri}">Home</a>
          </body>
        </html>
      `);
    });

  }).on('error', (err) => {
    console.log('Error: ' + err.message);

    error = err;

    // Return data to the client-side
    const qs = querystring.stringify({
      username,
      issuer,
      status,
      error: error.toString(),
    });
    res.redirect('/?' + qs);
  });

  post.write(postData);
  post.end();
});
app.listen(port, function () {
  console.log(`Test app running at http://localhost/${port}!\n`);
});
