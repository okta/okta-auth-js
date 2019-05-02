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

/* global console, Promise */
/* eslint-disable no-console */
import OktaAuth from '@okta/okta-auth-js';

function bindFunctions(testApp, window) {
  // getWithRedirect
  window.loginRedirectPKCE = testApp.loginRedirect.bind(testApp, {
    grantType: 'authorization_code'
  });
  window.loginRedirectImplicit = testApp.loginRedirect.bind(testApp, {
    grantType: 'implicit'
  });

  // getWithPopup
  window.loginPopupPKCE = testApp.loginPopup.bind(testApp, {
    grantType: 'authorization_code'
  });
  window.loginPopupImplicit = testApp.loginPopup.bind(testApp, {
    grantType: 'implicit'
  });

  window.logout = testApp.logout.bind(testApp);
}

function TestApp(config) {
  this.oktaAuth = new OktaAuth(config);
}

export default TestApp;

Object.assign(TestApp.prototype, {
  // Mount into the DOM
  mount: async function(window, rootElem, pathname) {
    this.rootElem = rootElem;
    bindFunctions(this, window);
    return this.render(pathname, this.rootElem)
    .then(() => {
      return this;
    });
  },
  // Load and render the app
  render: async function(pathname, elem) {
    pathname = pathname || '';
    elem = elem || this.rootElem;
    return Promise.resolve()
    .then(() => {
      const isCallback = pathname.startsWith('/implicit/callback');
      if (isCallback) {
        return this.renderCallback();
      }
      return this.renderHome();
    })
    .then(content => {
      if (elem) {
        elem.innerHTML = `<div>${content}</div>`;
      }
      return content;
    });
  },
  renderCallback: async function() {
    let tokens = [];
    try {
      tokens = await this.handleAuthentication();
    } catch(e) {
      console.error(e);
    }
    return this.callbackHTML(tokens)

  },
  renderHome: async function() {
    // Default home page
    let user;
    try {
      user = await this.getUser();
    } catch (e) {
      console.error(e);
    }
    return this.appHTML({
      user,
    });
  },
  loginRedirect: async function(options, event) {
    event && event.preventDefault(); // Necessary to prevent default navigation for redirect below
    options = Object.assign({}, {
      responseType: ['id_token', 'token']
    }, options);
    return this.oktaAuth.token.getWithRedirect(options);
  },
  loginPopup: async function(options, event) {
    event && event.preventDefault(); // Necessary to prevent default navigation for redirect below
    options = Object.assign({}, {
      responseType: ['id_token', 'token']
    }, options);
    return this.oktaAuth.token.getWithPopup(options)
    .then((tokens) => {
      this.saveTokens(tokens);
      this.render();
    })
  },
  logout: async function() {
    this.oktaAuth.tokenManager.clear();
    await this.oktaAuth.signOut();
    // window.location.reload();
  },
  handleAuthentication: async function() {
    // parseFromUrl() Will parse the authorization code from the URL fragment and exchange it for tokens
    let tokens = await this.oktaAuth.token.parseFromUrl();
    this.saveTokens(tokens);
    return tokens;
  },
  saveTokens: function(tokens) {
    tokens = Array.isArray(tokens) ? tokens : [tokens];
    tokens.forEach((token) => {
      if (token.idToken) {
        this.oktaAuth.tokenManager.add('idToken', token);
      } else if (token.accessToken) {
        this.oktaAuth.tokenManager.add('accessToken', token);
      }
    });
  },
  getUser: async function() {
    const accessToken = await this.oktaAuth.tokenManager.get('accessToken');
    const idToken = await this.oktaAuth.tokenManager.get('idToken');
    if (accessToken && idToken) {
      const userinfo = await this.oktaAuth.token.getUserInfo(accessToken);
      if (userinfo.sub === idToken.claims.sub) {
        // Only return the userinfo response if subjects match to
        // mitigate token substitution attacks
        return userinfo;
      }
    }
    return idToken ? idToken.claims : undefined;
  },
  appHTML: function(props) {
    const { user } = props;
    const content = (user ?
      `<h2>Welcome back, ${user.email}</h2>
      <hr/>
      <a href="/" onclick="logout()">Logout</a>` :
      `<h2>Greetings, user!</h2>
      <hr/>
      <h2>PKCE flow</h2>
      <a id="login-redirect-pkce" href="/" onclick="loginRedirectPKCE(event)">Login (using REDIRECT)</a>
      <a id="login-popup-pkce" href="/" onclick="loginPopupPKCE(event)">Login (using POPUP)</a>
      <br/>
      <h2>Implicit flow</h2>
      <a id="login-redirect-implicit" href="/" onclick="loginRedirectImplicit(event)">Login (using REDIRECT)</a>
      <a id="login-popup-implicit" href="/" onclick="loginPopupImplicit(event)">Login (using POPUP)</a>`
    );
    return content;
  },
  tokensHTML: function(tokens) {
    if (tokens.length < 2) {
      return '<b>Tokens not returned. Check error console for details</b><br/>';
    }

    const idToken = tokens[0];
    const claims = idToken.claims;
    const html = `
    <table id="claims">
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
  },
  callbackHTML: function(tokens) {
    const content = `
      <a href="/">Return Home</a>
      <hr/>
      ${this.tokensHTML(tokens)}
    `;
    return content;
  }
});


