/*
 * Copyright (c) 2018, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* global process, window, document */
/* eslint-disable no-console */
import OktaAuth from '@okta/okta-auth-js';

/* eslint-disable prefer-destructuring */
const DOMAIN = process.env.DOMAIN;
const CLIENT_ID = process.env.CLIENT_ID;
/* eslint-enable prefer-destructuring */

const ISSUER = `https://${DOMAIN}/oauth2/default`;
const HOST = window.location.host;
const REDIRECT_URI = `http://${HOST}/implicit/callback`;

const oktaAuth = new OktaAuth({
  issuer: ISSUER,
  clientId: CLIENT_ID,
  redirectUri: REDIRECT_URI,
});

async function login(implicit, event) {
  event.preventDefault(); // Necessary to prevent default navigation for redirect below

  oktaAuth.token.getWithRedirect({
    grantType: implicit ? 'implicit' : 'authorization_code',
    responseType: ['id_token', 'token']
  });
}

async function logout() {
  oktaAuth.tokenManager.clear();
  await oktaAuth.signOut();
  window.location.reload();
}

window.loginPKCE = login.bind(null, false);
window.loginImplicit = login.bind(null, true);
window.logout = logout.bind(null);

async function handleAuthentication() {
  // parseFromUrl() Will parse the authorization code from the URL fragment and exchange it for tokens
  let tokens = await oktaAuth.token.parseFromUrl();
  tokens = Array.isArray(tokens) ? tokens : [tokens];
  tokens.forEach((token) => {
    if (token.idToken) {
      oktaAuth.tokenManager.add('idToken', token);
    } else if (token.accessToken) {
      oktaAuth.tokenManager.add('accessToken', token);
    }
  });
  return tokens;
}

async function getUser() {
  const accessToken = await oktaAuth.tokenManager.get('accessToken');
  const idToken = await oktaAuth.tokenManager.get('idToken');
  if (accessToken && idToken) {
    const userinfo = await oktaAuth.token.getUserInfo(accessToken);
    if (userinfo.sub === idToken.claims.sub) {
      // Only return the userinfo response if subjects match to
      // mitigate token substitution attacks
      return userinfo;
    }
  }
  return idToken ? idToken.claims : undefined;
}


function renderApp(props) {
  const { user } = props;
  const content = (user ?
    `<h2>Welcome back, ${user.email}</h2>
    <hr/>
    <a href="/" onclick="logout()">Logout</a>` :
    `<h2>Greetings, user!</h2>
    <hr/>
    <a href="/" onclick="loginPKCE(event)">Login (using PKCE)</a>
    <br/>
    <a href="/" onclick="loginImplicit(event)">Login (using Implicit Flow)</a>`
  );
  const rootEl = document.getElementById('root');
  rootEl.innerHTML = `<div>${content}</div>`;
}

function tokensHTML(tokens) {
  if (tokens.length < 2) {
    return '<b>Tokens not returned. Check error console for details</b><br/>';
  }

  const idToken = tokens[0];
  const claims = idToken.claims;
  const html = `
  <table>
    <thead>
      <tr>
        <th>Claim</th><th>Value</th>
      </tr>
    </thead>
    <tbody>
    ${
      Object.keys(claims).map((key) => {
        return `<tr><td>${key}</td><td>${claims[key]}</td></tr>`;
      }).join('\n')
    }
    </tbody>
  </table>
  `;
  return html;
}

function renderCallback(tokens) {
  const rootEl = document.getElementById('root');
  const content = `
    <a href="/">Return Home</a>
    <hr/>
    ${tokensHTML(tokens)}
  `;
  rootEl.innerHTML = `<div>${content}</div>`;
}

async function start() {
  const { pathname } = window.location;
  if (pathname.startsWith('/implicit/callback')) {
    let tokens = [];
    try {
      tokens = await handleAuthentication();
    } catch(e) {
      console.error(e);
    }
    return renderCallback(tokens);
  }
  let user;
  try {
    user = await getUser();
  } catch (e) {
    console.error(e);
  }

  return renderApp({
    user,
  });
}

export default start;
