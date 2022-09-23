const { URLSearchParams } = require('url');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { makeJwt } = require('./jwt');
const { toQueryString } = require('../src/util');

const privateKey = fs.readFileSync(path.resolve(__dirname, 'private.key')).toString();

async function cibaBcAuthorizeMiddleware(req, res) {
  console.log('cibaBcAuthorizeMiddleware received form data:', req.body);
  const config = JSON.parse(req.body.config);
  const loginHint = req.body.login_hint;
  const scope = config.scopes.join(' ');
  const { issuer, clientId } = config;
  
  const token = await makeJwt(
    clientId,
    privateKey,
    { aud: `${issuer}/v1/bc/authorize` },
  ).then(jwt => jwt.compact());
  const params = new URLSearchParams();
  params.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
  params.append('client_assertion', token);
  params.append('login_hint', loginHint);
  params.append('scope', scope);

  const resp = await fetch(
    `${issuer}/v1/bc/authorize`,
    {
      method: 'post',
      body: params
    }
  ).then(res => res.json());

  const qs = toQueryString(Object.assign({}, config, {
    bcResponse: JSON.stringify(resp, null, 2),
  }));
  console.log('Reloading the page.');
  res.redirect('/server' + qs);
}

module.exports = {
  cibaBcAuthorizeMiddleware,
};
