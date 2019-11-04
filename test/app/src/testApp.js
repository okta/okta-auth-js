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

/* global document, window, Promise */
/* eslint-disable no-console */
import OktaAuth from '@okta/okta-auth-js';
import { saveConfigToStorage } from './config';
import { MOUNT_PATH } from './constants';
import { htmlString, toQueryParams } from './util';
import { Form, updateForm } from './form';
import { tokensHTML } from './tokens';

function homeLink(app) {
  return `<a id="return-home" href="${app.originalUrl}">Return Home</a>`;
}

function logoutLink(app) {
  return `<a id="logout" href="${app.originalUrl}" onclick="logoutAndReload(event)">Logout</a>`;
}

const Footer = `
`;

const Layout = `
  <div id="layout">
    <div id="page-content"></div>
    <div id="config-area" class="flex-row">
      <div id="form-content" class="box">${Form}</div>
      <div id="config-dump" class="box"></div>
    </div>
    ${Footer}
  </div>
`;

function bindFunctions(testApp, window) {
  window.loginRedirect = testApp.loginRedirect.bind(testApp, {});
  window.loginPopup = testApp.loginPopup.bind(testApp, {});
  window.loginDirect = testApp.loginDirect.bind(testApp);
  window.getToken = testApp.getToken.bind(testApp, {});
  window.logout = testApp.logout.bind(testApp);
  window.logoutAndReload = testApp.logoutAndReload.bind(testApp);
  window.renewToken = testApp.renewToken.bind(testApp);
  window.handleCallback = testApp.handleCallback.bind(testApp);
  window.getUserInfo = testApp.getUserInfo.bind(testApp);
}

function TestApp(config) {
  this.config = config;
}

export default TestApp;

Object.assign(TestApp.prototype, {
  // Mount into the DOM
  mount: function(window, rootElem) {
    this.originalUrl = MOUNT_PATH + toQueryParams(this.config);
    this.rootElem = rootElem;
    this.rootElem.innerHTML = Layout;
    updateForm(this.config);
    document.getElementById("config-dump").innerHTML = this.configHTML();
    this.contentElem = document.getElementById("page-content");
    bindFunctions(this, window);
  },
  getSDKInstance() {
    return Promise.resolve()
      .then(() => {
        this.oktaAuth = this.oktaAuth || new OktaAuth(this.config); // can throw
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
    const xhrError = e && e.xhr ? e.xhr.message : '';
    this._setContent(`
      <div id="error" style="color: red">${e.toString()}</div>
      <div id="xhr-error" style="color: red">${xhrError}</div>
      <hr/>
      ${homeLink(this)}
      ${logoutLink(this)}
    `);
    this._afterRender('with-error');
  },
  loginDirect: async function(e) {
    e && e.preventDefault();
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
  loginRedirect: async function(options, event) {
    event && event.preventDefault(); // prevent navigation / page reload
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
  logoutAndReload: function(event) {
    event && event.preventDefault();
    this.logout().then(() => {
      window.location.reload();
    });
  },
  handleCallback: async function(e) {
    e && e.preventDefault();

    return this.getTokensFromUrl()
      .catch(e => {
        this.renderError(e);
        throw e;
      })
      .then(tokens => this.callbackHTML(tokens))
      .then(content => this._setContent(content))
      .then(() => this._afterRender('callback-handled'));
  },
  getTokensFromUrl: async function() {
    // parseFromUrl() Will parse the authorization code from the URL fragment and exchange it for tokens
    let tokens = await this.oktaAuth.token.parseFromUrl();
    this.saveTokens(tokens);
    return tokens;
  },
  saveTokens: function(tokens) {
    tokens = Array.isArray(tokens) ? tokens : [tokens];
    tokens.forEach((token) => {
      if (!token) {
        throw new Error('BAD/EMPTY token returned');
      } else if (token.idToken) {
        this.oktaAuth.tokenManager.add('idToken', token);
      } else if (token.accessToken) {
        this.oktaAuth.tokenManager.add('accessToken', token);
      } else {
        throw new Error('Unknown token returned: ' + JSON.stringify(token));
      }
    });
  },
  getTokens: async function() {
    const accessToken = await this.oktaAuth.tokenManager.get('accessToken');
    const idToken = await this.oktaAuth.tokenManager.get('idToken');
    return { accessToken, idToken };
  },
  getUserInfo: async function(event) {
    event && event.preventDefault(); // prevent navigation / page reload
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
        <h2>Welcome back</h2>
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
        </ul>
        <div id="user-info"></div>
        <hr/>
        ${ tokensHTML([idToken, accessToken])}
      `;
    }
    
    // Unauthenticated user, Login page
    return `
      <h2>Greetings, unknown user!</h2>
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

  callbackHTML: function(tokens) {
    const success = tokens && tokens.length === 2;
    const errorMessage = success ? '' :  'Tokens not returned. Check error console for more details';
    const successMessage = success ? 'Successfully received tokens on the callback page!' : '';
    const content = `
      <div id="callback-result">
        <strong><div id="success">${successMessage}</div></strong>
        <div id="error">${errorMessage}</div>
        <div id="xhr-error"></div>
      </div>
      <hr/>
      ${homeLink(this)}
      ${ success ? tokensHTML(tokens): '' }
    `;
    return content;
  }
});
