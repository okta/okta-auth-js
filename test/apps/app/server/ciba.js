const { OktaAuth } = require('@okta/okta-auth-js');
const { toQueryString } = require('../src/util');

const privateKey = process.env.PEM;

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
    privateKey,
    clientSecret,
  });
  const { 
    headers, // eslint-disable-line
    ...restResp 
  } = await authClient.authenticateWithCiba({
    loginHint,
  });

  const qs = toQueryString(Object.assign({}, config, {
    cibaClientAuth: JSON.stringify(restResp, null, 2),
  }));
  console.log('Reloading the page.');
  res.redirect('/server' + qs);
}

module.exports = {
  cibaClientAuthMiddleware,
};
