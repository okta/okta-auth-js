// Handle OIDC callback. The request query will contain a code and state
app.get('{{ redirectPath }}', function(req, res) {
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