// @ts-nocheck
/* eslint-disable no-console */

const OktaAuthJS = require('@okta/okta-auth-js').OktaAuth;

const express = require('express');
const querystring = require('querystring');
{{#if oidc}}
const uuid = require('uuid');
const https = require('https');
const btoa = require('btoa');

const redirectUrl = `http://localhost:{{ port }}{{ redirectPath}}`;

// converts a string to base64 (url/filename safe variant)
function stringToBase64Url(str) {
  var b64 = btoa(str);
  return base64ToBase64Url(b64);
}

// converts a standard base64-encoded string to a "url/filename safe" variant
function base64ToBase64Url(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
{{/if}}

const port = {{ port }};
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

    {{#if oidc}}
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
    {{else}}
    // Return data to the client-side
    const qs = querystring.stringify({
      username,
      issuer,
      status,
      sessionToken, 
      error,
    });
    res.redirect('/?' + qs);
    {{/if}}

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

{{#if oidc}}
{{> express/oidc-middleware.js }}
{{/if}}

app.listen(port, function () {
  console.log(`Test app running at http://localhost/${port}!\n`);
});
