/*
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* global console */
/* eslint-disable no-console */
import OktaAuth from '@okta/okta-auth-js';

function bindFunctions(testApp, window) {

  // getWithRedirect
  window.loginRedirectPKCE = testApp.loginRedirect.bind(testApp, {
    pkce: true,
  });
  window.loginRedirectImplicit = testApp.loginRedirect.bind(testApp, {

  });

  // getWithPopup
  window.loginPopupPKCE = testApp.loginPopup.bind(testApp, {
    pkce: true,
  });
  window.loginPopupImplicit = testApp.loginPopup.bind(testApp, {

  });

  // getWithoutPrompt
  window.getTokenPKCE = testApp.getToken.bind(testApp, {
    pkce: true,
  });

  window.getTokenImplicit = testApp.getToken.bind(testApp, {

  });

  window.logout = testApp.logout.bind(testApp);

  window.renewToken = testApp.renewToken.bind(testApp);
}

function TestApp(config) {
  this.config = config;
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
    const isCallback = pathname.startsWith('/implicit/callback');
    return (isCallback ? this.renderCallback() : this.renderHome())
    .then(content => {
      if (elem) {
        elem.innerHTML = `<div>${content}</div>`;
      }
      return content;
    });
  },
  renderCallback: async function() {
    return this.handleAuthentication()
      .catch(e => {
        console.error(e);
      })
      .then(tokens => {
        return this.callbackHTML(tokens);
      });
  },
  renderHome: async function() {
    // Default home page
    return this.getUserData()
    .catch((e) => {
      console.error(e);
    })
    .then(data => {
      return this.appHTML(data);
    });
  },
  loginRedirect: async function(options, event) {
    event && event.preventDefault(); // prevent navigation / page reload
    options = Object.assign({}, {
      responseType: this.config.responseType,
      scopes: this.config.scopes,
    }, options);
    return this.oktaAuth.token.getWithRedirect(options);
  },
  loginPopup: async function(options, event) {
    event && event.preventDefault(); // prevent navigation / page reload
    options = Object.assign({}, {
      responseType: this.config.responseType,
      scopes: this.config.scopes,
    }, options);
    return this.oktaAuth.token.getWithPopup(options)
    .then((tokens) => {
      this.saveTokens(tokens);
      this.render();
    });
  },
  getToken: async function(options, event) {
    event && event.preventDefault(); // prevent navigation / page reload
    options = Object.assign({}, {
      responseType: this.config.responseType,
      scopes: this.config.scopes,
    }, options);
    return this.oktaAuth.token.getWithoutPrompt(options)
    .then((tokens) => {
      this.saveTokens(tokens);
      this.render();
    });
  },
  // pkce must be already set before calling this method
  renewToken: async function(event) {
    event && event.preventDefault(); // prevent navigation / page reload
    return this.oktaAuth.tokenManager.renew('idToken')
      .then(() => {
        this.render();
      });
  },
  logout: async function() {
    this.oktaAuth.tokenManager.clear();
    return this.oktaAuth.signOut();
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
      if (!token) {
        console.error('BAD/EMPTY token returned');
        return;
      } else if (token.idToken) {
        this.oktaAuth.tokenManager.add('idToken', token);
      } else if (token.accessToken) {
        this.oktaAuth.tokenManager.add('accessToken', token);
      } else {
        console.error('Unknown token returned: ', token);
      }
    });
  },
  getUserData: async function() {
    const accessToken = await this.oktaAuth.tokenManager.get('accessToken');
    const idToken = await this.oktaAuth.tokenManager.get('idToken');
    if (accessToken && idToken) {
      const user = await this.oktaAuth.token.getUserInfo(accessToken);
      if (user.sub === idToken.claims.sub) {
        // Only return the userinfo response if subjects match to
        // mitigate token substitution attacks
        return { user, accessToken, idToken };
      }
    }
  },
  appHTML: function(props) {
    const { user, idToken, accessToken } = props || {};
    const config = JSON.stringify(this.config, null, 2).replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;');
    if (user) {
      // Authenticated user home page
      return `
      <h2>Welcome back, ${user.email}</h2>
      <hr/>
      <a href="/" onclick="logout()">Logout</a>
      <hr/>
      <ul>
        <li>
          <a id="renewtoken" href="/" onclick="renewToken(event)"><b>Renew Token</b></a>
          <p>(must set pkce via constructor)
          <div>
            <b>pkce:</b>
            <a href="/?pkce=1">pkce flow</a>
              &nbsp;|&nbsp;
            <a href="/">implicit flow</a>
          </div>
          </p>
        </li>
        <li><b>Get Token</b>
          <ul>
            <li><a id="gettoken-pkce" href="/" onclick="getTokenPKCE(event)">Get Token using PKCE flow</a></li>
            <li><a id="gettoken-implicit" href="/" onclick="getTokenImplicit(event)">Get Token using Implicit flow</a></li>
          </ul>
        </li>
      </ul>
      <hr/>
      ${ this.tokensHTML([idToken, accessToken])}
      <hr/>
      <h2>Config</h2>
      ${ config }
      `;
    }
    
    // Unauthenticated user, Login page
    return `
      <h2>Greetings, user!</h2>
      <hr/>
      <ul>
        <li><b>Login using REDIRECT</b>
          <ul>
          <li><a id="login-redirect-pkce" href="/" onclick="loginRedirectPKCE(event)">login using PKCE Flow</a></li>
          <li><a id="login-redirect-implicit" href="/" onclick="loginRedirectImplicit(event)">login using Implicit Flow</a></li>
          </ul>
        </li>
        <li><b>Login using POPUP</b>
          <ul>
            <li><a id="login-popup-pkce" href="/" onclick="loginPopupPKCE(event)">login using PKCE flow</a></li>
            <li><a id="login-popup-implicit" href="/" onclick="loginPopupImplicit(event)">login using Implicit Flow</a></li>
        </li>
      </ul>
      <hr/>
      <h2>Config</h2>
      ${ config }
      `;

  },
  tokensHTML: function(tokens) {
    if (!tokens || tokens.length < 2) {
      return '<b></b><br/>';
    }

    const idToken = tokens.filter(token => {
      return token.idToken;
    })[0];
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
    const success = tokens && tokens.length === 2;
    const message = success ? 'Successfully received tokens on the callback page!' : 'Tokens not returned. Check error console for details';
    const content = `
      <b>${message}</b>
      <br/>
      <a href="/">Return Home</a>
      <hr/>
      ${ success ? this.tokensHTML(tokens): '' }
    `;
    return content;
  }
});
