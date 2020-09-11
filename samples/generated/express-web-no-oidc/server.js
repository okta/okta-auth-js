// @ts-nocheck
/* eslint-disable no-console */

const OktaAuthJS = require('@okta/okta-auth-js').OktaAuth;

const express = require('express');
const querystring = require('querystring');

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

    // Return data to the client-side
    const qs = querystring.stringify({
      username,
      issuer,
      status,
      sessionToken, 
      error,
    });
    res.redirect('/?' + qs);

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


app.listen(port, function () {
  console.log(`Test app running at http://localhost/${port}!\n`);
});
