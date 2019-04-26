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

/* global console */
/* eslint-disable no-console */
import OktaAuth from '@okta/okta-auth-js';

export default function(window, document) {

  function TestApp(config) {
    this.oktaAuth = new OktaAuth(config);

    window.loginPKCE = this.login.bind(null, {
      grantType: 'authorization_code'
    });
    window.loginImplicit = this.login.bind(null, {
      grantType: 'implicit'
    });
    window.logout = this.logout.bind(null);
  }

  Object.assign(TestApp.prototype, {
    bootstrap: async function(pathname) {
      pathname = pathname || '';
      const isCallback = pathname.startsWith('/implicit/callback');
      if (isCallback) {
        let tokens = [];
        try {
          tokens = await this.handleAuthentication();
        } catch(e) {
          console.error(e);
        }
        return this.renderCallback(tokens);
      }
      // Default home page
      let user;
      try {
        user = await this.getUser();
      } catch (e) {
        console.error(e);
      }

      return this.renderApp({
        user,
      });
    },
    login: async function(options, event) {
      event && event.preventDefault(); // Necessary to prevent default navigation for redirect below
      options = Object.assign({}, {
        responseType: ['id_token', 'token']
      }, options);
      this.oktaAuth.token.getWithRedirect(options);
    },
    logout: async function() {
      this.oktaAuth.tokenManager.clear();
      await this.oktaAuth.signOut();
      // window.location.reload();
    },
    handleAuthentication: async function() {
      // parseFromUrl() Will parse the authorization code from the URL fragment and exchange it for tokens
      let tokens = await this.oktaAuth.token.parseFromUrl();
      tokens = Array.isArray(tokens) ? tokens : [tokens];
      tokens.forEach((token) => {
        if (token.idToken) {
          this.oktaAuth.tokenManager.add('idToken', token);
        } else if (token.accessToken) {
          this.oktaAuth.tokenManager.add('accessToken', token);
        }
      });
      return tokens;
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
    renderApp: function(props) {
      const { user } = props;
      const content = (user ?
        `<h2>Welcome back, ${user.email}</h2>
        <hr/>
        <a href="/" onclick="logout()">Logout</a>` :
        `<h2>Greetings, user!</h2>
        <hr/>
        <a id="login-pkce" href="/" onclick="loginPKCE(event)">Login (using PKCE)</a>
        <br/>
        <a id="login-implicit" href="/" onclick="loginImplicit(event)">Login (using Implicit Flow)</a>`
      );
      const rootEl = document.getElementById('root');
      rootEl.innerHTML = `<div>${content}</div>`;
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
    renderCallback: function(tokens) {
      const rootEl = document.getElementById('root');
      const content = `
        <a href="/">Return Home</a>
        <hr/>
        ${this.tokensHTML(tokens)}
      `;
      rootEl.innerHTML = `<div>${content}</div>`;
    }
  });

  return TestApp;
}
