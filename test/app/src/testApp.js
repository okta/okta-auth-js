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

/* eslint-disable no-console */
import OktaAuth from '@okta/okta-auth-js';
import { saveConfigToStorage, flattenConfig } from './config';
import { MOUNT_PATH } from './constants';
import { htmlString, toQueryParams } from './util';
import { Form, updateForm } from './form';
import { tokensHTML } from './tokens';

function homeLink(app) {
  return `<a id="return-home" href="${app.originalUrl}">Return Home</a>`;
}

function logoutLink(app) {
  return `
  <a id="logout-redirect" href="${app.originalUrl}" onclick="logoutRedirect(event)">Logout (and redirect here)</a><br/>
  <a id="logout-xhr" href="${app.originalUrl}" onclick="logoutXHR(event)">Logout (XHR + reload)</a><br/>
  <a id="logout-app" href="${app.originalUrl}" onclick="logoutApp(event)">Logout (app only)</a><br/>
  `;
}

const Footer = `
`;

const Layout = `
  <div id="layout">
    <div id="session-expired" style="color: orange"></div>
    <div id="token-error" style="color: red"></div>
    <div id="token-msg" style="color: green"></div>
    <div id="page-content"></div>
    <div id="config-area" class="flex-row">
      <div id="form-content" class="box">${Form}</div>
      <div id="config-dump" class="box"></div>
    </div>
    ${Footer}
  </div>
`;

function makeClickHandler(fn) {
  return function(event) {
    event && event.preventDefault(); // prevent navigation / page reload
    return fn();
  };
}

function bindFunctions(testApp, window) {
  var boundFunctions = {
    loginRedirect: testApp.loginRedirect.bind(testApp, {}),
    loginPopup: testApp.loginPopup.bind(testApp, {}),
    loginDirect: testApp.loginDirect.bind(testApp),
    getToken: testApp.getToken.bind(testApp, {}),
    clearTokens: testApp.clearTokens.bind(testApp),
    logoutRedirect: testApp.logoutRedirect.bind(testApp),
    logoutXHR: testApp.logoutXHR.bind(testApp),
    logoutApp: testApp.logoutApp.bind(testApp),
    refreshSession: testApp.refreshSession.bind(testApp),
    renewToken: testApp.renewToken.bind(testApp),
    revokeToken: testApp.revokeToken.bind(testApp),
    handleCallback: testApp.handleCallback.bind(testApp),
    getUserInfo: testApp.getUserInfo.bind(testApp),
  };
  Object.keys(boundFunctions).forEach(functionName => {
    window[functionName] = makeClickHandler(boundFunctions[functionName]);
  });
}

function TestApp(config) {
  this.config = config;
  Object.assign(this.config, {
    onSessionExpired: this._onSessionExpired.bind(this)
  });
}

export default TestApp;

Object.assign(TestApp.prototype, {
  // Mount into the DOM
  mount: function(window, rootElem) {
    this.originalUrl = MOUNT_PATH + toQueryParams(flattenConfig(this.config));
    this.rootElem = rootElem;
    this.rootElem.innerHTML = Layout;
    updateForm(this.config);
    document.getElementById('config-dump').innerHTML = this.configHTML();
    this.contentElem = document.getElementById('page-content');
    bindFunctions(this, window);
  },
  getSDKInstance() {
    return Promise.resolve()
      .then(() => {
        this.oktaAuth = this.oktaAuth || new OktaAuth(Object.assign({}, this.config)); // can throw
        this.oktaAuth.tokenManager.on('error', this._onTokenError.bind(this));
      });
  },
  _setContent: function(content) {
    this.contentElem.innerHTML = `
      <div>${content}</div>
    `;
  },
  _afterRender: function(extraClass) {
    this.rootElem.classList.add('rendered');
    if (extraClass) {
      this.rootElem.classList.add(extraClass);
    }
  },
  _onTokenError: function(error) {
    document.getElementById('token-error').innerText = error;
  },
  _onSessionExpired: function() {
    document.getElementById('session-expired').innerText = 'SESSION EXPIRED';
  },
  bootstrapCallback: async function() {
    const content = `
      <a id="handle-callback" href="/" onclick="handleCallback(event)">Handle callback (Continue Login)</a>
      <hr/>
      ${homeLink(this)}
    `;
    return this.getSDKInstance()
      .then(() => this._setContent(content))
      .then(() => this._afterRender('callback'));
  },
  bootstrapHome: async function() {
    // Default home page
    return this.getSDKInstance()
      .then(() => this.render());
  },
  render: function() {
    this.getTokens()
    .catch((e) => {
      this.renderError(e);
      throw e;
    })
    .then(data => this.appHTML(data))
    .then(content => this._setContent(content))
    .then(() => {
      // Add a special highlight on links when they are clicked
      let links = Array.prototype.slice.call(document.getElementsByTagName('a'));
      links.forEach(link => {
        link.addEventListener('click', function() {
          this.classList.add('clicked');
        });
      });
      this._afterRender();
    });
  },
  renderError: function(e) {
    const xhrError = e && e.xhr ? (e.xhr.message || 'Network request failed') : '';
    this._setContent(`
      <div id="error" style="color: red">${e.toString()}</div>
      <div id="xhr-error" style="color: red">${xhrError}</div>
      <hr/>
      ${homeLink(this)}
      ${logoutLink(this)}
    `);
    this._afterRender('with-error');
  },
  loginDirect: async function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    return this.oktaAuth.signIn({username, password})
    .then(res => {
      if (res.status === 'SUCCESS') {
        saveConfigToStorage(this.config);
        return this.oktaAuth.token.getWithRedirect({
          sessionToken: res.sessionToken,
          responseType: this.config.responseType
        });
      }
    })
    .catch(e => {
      this.renderError(e);
      throw e;
    });
  },
  loginRedirect: async function(options) {
    saveConfigToStorage(this.config);
    options = Object.assign({}, {
      responseType: this.config.responseType,
      scopes: this.config.scopes,
    }, options);
    return this.oktaAuth.token.getWithRedirect(options)
      .catch(e => {
        this.renderError(e);
        throw e;
      });
  },
  loginPopup: async function(options) {
    options = Object.assign({}, {
      responseType: this.config.responseType,
      scopes: this.config.scopes,
    }, options);
    return this.oktaAuth.token.getWithPopup(options)
    .then(res => {
      this.saveTokens(res.tokens);
      this.render();
    });
  },
  getToken: async function(options) {
    options = Object.assign({}, {
      responseType: this.config.responseType,
      scopes: this.config.scopes,
    }, options);
    return this.oktaAuth.token.getWithoutPrompt(options)
    .then(res => {
      this.saveTokens(res.tokens);
      this.render();
    });
  },
  refreshSession: async function() {
    return this.oktaAuth.session.refresh();
  },
  revokeToken: async function() {
    return this.oktaAuth.revokeAccessToken()
    .then(() => {
      document.getElementById('token-msg').innerHTML = 'access token revoked';
    });
  },
  renewToken: async function() {
    return this.oktaAuth.tokenManager.renew('accessToken')
      .then(() => {
        this.render();
      });
  },
  logoutRedirect: function() {
    this.oktaAuth.signOut()
      .catch(e => {
        console.error('Error during signout & redirect: ', e);
      });
  },
  logoutXHR: async function() {
    await this.oktaAuth.revokeAccessToken();
    this.oktaAuth.closeSession()
      .catch(e => {
        console.error('Error during signout & redirect: ', e);
      })
      .then(() => {
        window.location.reload();
      });
  },
  logoutApp: async function() {
    await this.oktaAuth.revokeAccessToken();
    this.oktaAuth.tokenManager.clear();
    window.location.reload();
  },
  handleCallback: async function() {
    return this.getTokensFromUrl()
      .catch(e => {
        this.renderError(e);
        throw e;
      })
      .then(res => {
        return this.callbackHTML(res);
      })
      .then(content => this._setContent(content))
      .then(() => this._afterRender('callback-handled'));
  },
  getTokensFromUrl: async function() {
    // parseFromUrl() Will parse the authorization code from the URL fragment and exchange it for tokens
    const res = await this.oktaAuth.token.parseFromUrl();
    this.saveTokens(res.tokens);
    return res;
  },
  saveTokens: function(tokens) {
    const { idToken, accessToken } = tokens;
    if (idToken) {
      this.oktaAuth.tokenManager.add('idToken', idToken);
    }
    if (accessToken) {
      this.oktaAuth.tokenManager.add('accessToken', accessToken);
    }
  },
  getTokens: async function() {
    const accessToken = await this.oktaAuth.tokenManager.get('accessToken');
    const idToken = await this.oktaAuth.tokenManager.get('idToken');
    return { accessToken, idToken };
  },
  clearTokens: function() {
    this.oktaAuth.tokenManager.clear();
  },
  getUserInfo: async function() {
    const { accessToken, idToken } = await this.getTokens();
    if (accessToken && idToken) {
      return this.oktaAuth.token.getUserInfo(accessToken)
        .catch(error => {
          this.renderError(error);
          throw error;
        })
        .then(user => {
          document.getElementById('user-info').innerHTML = htmlString(user);
        });
    } else {
      this.renderError(new Error('Missing tokens'));
    }
  },
  configHTML() {
    const config = htmlString(this.config);
    return `
      <h2>Config</h2>
      ${ config }
    `;
  },
  appHTML: function(props) {
    const { idToken, accessToken } = props || {};
    if (idToken || accessToken) {
      // Authenticated user home page
      return `
        <strong>Welcome back</strong>
        <hr/>
        ${logoutLink(this)}
        <hr/>
        <ul>
          <li>
            <a id="get-userinfo" href="/" onclick="getUserInfo(event)">Get User Info</a>
          </li>
          <li>
            <a id="renew-token" href="/" onclick="renewToken(event)">Renew Token</a>
          </li>
          <li>
            <a id="get-token" href="/" onclick="getToken(event)">Get Token (without prompt)</a>
          </li>
          <li>
            <a id="clear-tokens" href="/" onclick="clearTokens(event)">Clear Tokens</a>
          </li>
          <li>
            <a id="revoke-token" href="/" onclick="revokeToken(event)">Revoke Access Token</a>
          </li>
          <li>
            <a id="refresh-session" href="/" onclick="refreshSession(event)">Refresh Session</a>
          </li>
        </ul>
        <div id="user-info"></div>
        <hr/>
        ${ tokensHTML({idToken, accessToken})}
      `;
    }

    // Unauthenticated user, Login page
    return `
      <strong>Greetings, unknown user!</strong>
      <hr/>
      <ul>
        <li>
          <a id="login-redirect" href="/" onclick="loginRedirect(event)">Login using REDIRECT</a>
        </li>
        <li>
          <a id="login-popup" href="/" onclick="loginPopup(event)">Login using POPUP</a>
        </li>
      </ul>
      <h4/>
      <input name="username" id="username" placeholder="username" type="email"/>
      <input name="password" id="password" placeholder="password" type="password"/>
      <a href="/" id="login-direct" onclick="loginDirect(event)">Login DIRECT</a>
      `;
  },

  callbackHTML: function(res) {
    const tokensReceived = res.tokens ? Object.keys(res.tokens): [];
    const success = res.tokens && tokensReceived.length;
    const errorMessage = success ? '' :  'Tokens not returned. Check error console for more details';
    const successMessage = success ?
      'Successfully received tokens on the callback page: ' + tokensReceived.join(', ') : '';
    const content = `
      <div id="callback-result">
        <strong><div id="success">${successMessage}</div></strong>
        <div id="error">${errorMessage}</div>
        <div id="xhr-error"></div>
        <div id="res-state">State: <strong>${res.state}</strong></div>
      </div>
      <hr/>
      ${homeLink(this)}
      ${ success ? tokensHTML(res.tokens): '' }
    `;
    return content;
  }
});
