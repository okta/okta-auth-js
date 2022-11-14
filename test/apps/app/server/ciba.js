/* eslint-disable camelcase */

const { OktaAuth } = require('@okta/okta-auth-js');
const { toQueryString } = require('../src/util');

async function cibaClientAuthMiddleware(req, res) {
  console.log('cibaClientAuthMiddleware received form data:', req.body);
  const config = JSON.parse(req.body.config);
  const loginHint = req.body.login_hint;
  const { issuer, clientId, redirectUri } = config;

  const authClient = new OktaAuth({
    issuer: process.env.ISSUER || issuer,
    clientId: process.env.CLIENT_ID || clientId,
    scopes: config.scopes,
    redirectUri,
    // client can be authenticated by either clientSecret or privateKey
    privateKey: process.env.JWK || process.env.PEM,
    clientSecret: process.env.CLIENT_SECRET,
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
    ...( resp && { 
      cibaClientAuth: JSON.stringify(resp, null, 2),
      auth_req_id: resp.auth_req_id,
    }),
    ...( error && { error }),
  }));
  console.log('Reloading the page.');
  res.redirect('/server' + qs);
}

async function cibaTokenPollingMiddleware(req, res) {
  console.log('cibaTokenPollingMiddleware received form data:', req.body);
  const config = JSON.parse(req.body.config);
  const authReqId = req.body.auth_req_id;
  const { issuer, clientId, redirectUri } = config;

  const authClient = new OktaAuth({
    issuer: process.env.ISSUER || issuer,
    clientId: process.env.CLIENT_ID || clientId,
    scopes: config.scopes,
    redirectUri,
    // client can be authenticated by either clientSecret or privateKey
    privateKey: process.env.JWK || process.env.PEM,
    clientSecret: process.env.CLIENT_SECRET,
  });

  let resp, error;
  try {
    const { 
      headers, // eslint-disable-line
      ...restResp 
    } = await authClient.pollTokenWithCiba({
      authReqId,
    });
    resp = restResp;
  } catch (err) {
    console.log('Ciba poll token error', err);
    error = err;
  }
  
  const qs = toQueryString(Object.assign({}, config, {
    ...( resp && { tokens: JSON.stringify(resp, null, 2) }),
    ...( error && { error, auth_req_id: authReqId }),
  }));
  console.log('Reloading the page.');
  res.redirect('/server' + qs);
}


module.exports = {
  cibaClientAuthMiddleware,
  cibaTokenPollingMiddleware,
};
