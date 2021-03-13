const http = require('http');
const https = require('https');
const querystring = require('querystring');
const stringToBase64Url = require('./util').stringToBase64Url;

// The request query should contain a code and state, or an error and error_description.
module.exports = function handleAuthorizationCode(req, res) {
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
};
