const { OktaAuth } = require('@okta/okta-auth-js');
const { toQueryString } = require('../src/util');

async function cibaClientAuthMiddleware(req, res) {
  console.log('cibaClientAuthMiddleware received form data:', req.body);
  const config = JSON.parse(req.body.config);
  const loginHint = req.body.login_hint;
  const { issuer, clientId, redirectUri, clientSecret } = config;

  const authClient = new OktaAuth({
    issuer,
    clientId,
    scopes: config.scopes,
    redirectUri,
    // client can be authenticated by either clientSecret or privateKey
    privateKey: process.env.JWK || process.env.PEM,
    clientSecret,
  });

  let resp, error;
  try {
    const { 
      headers, // eslint-disable-line
      ...restResp 
    } = await authClient.authenticateWithCiba({
      loginHint,
    });
    resp = restResp;
  } catch (err) {
    console.log('Ciba client authentication error', err);
    error = err;
  }
  
  const qs = toQueryString(Object.assign({}, config, {
    ...( resp && { cibaClientAuth: JSON.stringify(resp, null, 2) }),
    ...( error && { error }),
  }));
  console.log('Reloading the page.');
  res.redirect('/server' + qs);
}

module.exports = {
  cibaClientAuthMiddleware,
};
