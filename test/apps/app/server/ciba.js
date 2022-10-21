const fs = require('fs');
const path = require('path');
const { OktaAuth } = require('@okta/okta-auth-js');
const { toQueryString } = require('../src/util');

const privateKey = fs.readFileSync(path.resolve(__dirname, 'private.key')).toString();

async function cibaClientAuthMiddleware(req, res) {
  console.log('cibaClientAuthMiddleware received form data:', req.body);
  const config = JSON.parse(req.body.config);
  const loginHint = req.body.login_hint;
  const { issuer, clientId, redirectUri } = config;

  const authClient = new OktaAuth({
    issuer,
    clientId,
    scopes: config.scopes,
    redirectUri,
    privateKey,
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
