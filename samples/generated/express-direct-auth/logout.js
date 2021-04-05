/*!
 * Copyright (c) 2019-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
const fetch = require('node-fetch');
const querystring = require('querystring');
// const OIDCMiddlewareError = require('./OIDCMiddlewareError');
const logout = module.exports;

const makeErrorHandler = () => err => {
  console.log('logout error -> ', err);
};

const makeAuthorizationHeader = ({ client_id, client_secret }) => 
  'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64');

const makeTokenRevoker = ({ issuer, client_id, client_secret, errorHandler }) => {
  const revokeEndpoint = `${issuer}/v1/revoke`;
  return ({ token_hint, token }) => { 
    return fetch(revokeEndpoint, { 
      method: 'POST',
      headers: { 
        'accepts': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': makeAuthorizationHeader({ client_id, client_secret }),
      },
      body: querystring.stringify({token, token_type_hint: token_hint}),
    })
      // eslint-disable-next-line promise/no-nesting
      .then( r => r.ok ? r : r.text().then(message => Promise.reject(new Error('revokeError', message)) ))
      .catch( errorHandler ) // catch and emit - this promise chain can never fail
  };
};


logout.forceLogoutAndRevoke = context => { 
  let { issuer, clientId, clientSecret } = context.options;
  const REVOKABLE_TOKENS = ['refresh_token', 'access_token'];
  // Support ORG Authorization Server
  if (issuer.indexOf('/oauth2') === -1) {
    issuer = issuer + '/oauth2';
  }
  const revokeToken = makeTokenRevoker({ 
    issuer, 
    client_id: clientId, 
    client_secret: clientSecret, 
    errorHandler: makeErrorHandler() 
  });
  return async (req, res /*, next */) => {
    const tokens = req.userContext.tokens;
    const revokeIfExists = token_hint => tokens[token_hint] ? revokeToken({token_hint, token: tokens[token_hint]}) : null;
    const revokes = REVOKABLE_TOKENS.map( revokeIfExists );

    // clear local session
    req.logout();

    // attempt all revokes
    await Promise.all(revokes); // these capture (emit) all rejections, no wrapping catch needed, no early fail of .all()

    const params = {
      id_token_hint: tokens.idToken.idToken,
      post_logout_redirect_uri: context.options.logoutRedirectUri,
    };

    // redirect to Okta to clear SSO session
    const endOktaSessionEndpoint = `${issuer}/v1/logout?${querystring.stringify(params)}`;
    return res.redirect(endOktaSessionEndpoint);
  };
};
