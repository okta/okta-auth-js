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
/* eslint-disable max-len */
import { 
  OktaAuth, 
  TokenResponse, 
  Tokens, 
  OktaAuthOptions, 
  AccessToken, 
  AuthTransaction, 
  TokenParams
} from '@okta/okta-auth-js';
import { saveConfigToStorage, flattenConfig, Config } from './config';
import { MOUNT_PATH } from './constants';
import { htmlString, toQueryString } from './util';
import { Form, updateForm } from './form';
import { tokensHTML } from './tokens';

declare global {
  interface Window {
    getWidgetConfig: () => any;
  }
}

interface GetSDKInstanceOptions {
  subscribeAuthStateChange?: boolean;
}

declare class OktaSignIn {
  constructor(options: any);
  showSignInToGetTokens(options: any): void;
}

function homeLink(app: TestApp): string {
  return `<a id="return-home" href="${app.originalUrl}">Return Home</a>`;
}

function logoutLink(app: TestApp): string {
  return `
  <a id="logout-redirect" href="${app.originalUrl}" onclick="logoutRedirect(event)">Logout (and redirect here)</a><br/>
  <a id="logout-xhr" href="${app.originalUrl}" onclick="logoutXHR(event)">Logout (XHR + reload)</a><br/>
  <a id="logout-app" href="${app.originalUrl}" onclick="logoutApp(event)">Logout (app only)</a><br/>
  `;
}

const Footer = `
`;

const Layout = `
  <div id="modal">
    <div id="widget-container">
      <div id="widget"></div>
    </div>
  </div>
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

function makeClickHandler(fn: () => void): Function {
  return function(event: Event): any {
    event && event.preventDefault(); // prevent navigation / page reload
    return fn();
  };
}

function bindFunctions(testApp: TestApp, window: Window): void {
  const boundFunctions = {
    loginWidget: testApp.loginWidget.bind(testApp),
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
    renewTokens: testApp.renewTokens.bind(testApp),
    revokeToken: testApp.revokeToken.bind(testApp),
    handleCallback: testApp.handleCallback.bind(testApp),
    getUserInfo: testApp.getUserInfo.bind(testApp),
    testConcurrentGetToken: testApp.testConcurrentGetToken.bind(testApp),
    testConcurrentLogin: testApp.testConcurrentLogin.bind(testApp),
    testConcurrentLoginViaTokenRenewFailure: testApp.testConcurrentLoginViaTokenRenewFailure.bind(testApp),
  };
  Object.keys(boundFunctions).forEach(functionName => {
    (window as any)[functionName] = makeClickHandler((boundFunctions as any)[functionName]);
  });
}

class TestApp {
  config: Config;
  originalUrl?: string;
  rootElem?: Element;
  contentElem?: Element;
  oktaAuth?: OktaAuth;
  constructor(config: Config) {
    this.config = config;
  }

  // Mount into the DOM
  mount(window: Window, rootElem: Element): void {
    const queryParams = toQueryString(flattenConfig(this.config));
    this.originalUrl = MOUNT_PATH + queryParams;
    this.rootElem = rootElem;
    this.rootElem.innerHTML = Layout;
    updateForm(this.config);
    document.getElementById('config-dump').innerHTML = this.configHTML();
    this.contentElem = document.getElementById('page-content');
    bindFunctions(this, window);
  }

  getSDKInstance({ subscribeAuthStateChange }: GetSDKInstanceOptions = { subscribeAuthStateChange: true }): Promise<void> {
    return Promise.resolve()
      .then(() => {
        // can throw
        this.oktaAuth = this.oktaAuth || new OktaAuth(Object.assign({}, this.config, {
          scopes: this.config._defaultScopes ? [] : this.config.scopes
        }));
        this.oktaAuth.tokenManager.on('error', this._onTokenError.bind(this));
        if (subscribeAuthStateChange) {
          this.oktaAuth.authStateManager.subscribe(this.render.bind(this));
        }
      });
  }

  _setContent(content: string): void {
    this.contentElem.innerHTML = `
      <div>${content}</div>
    `;
  }

  _afterRender(extraClass?: string): void {
    this.rootElem.classList.add('rendered');
    if (extraClass) {
      this.rootElem.classList.add(extraClass);
    }
  }

  _onTokenError(error: string): void {
    document.getElementById('token-error').innerText = error;
  }

  async bootstrapCallback(): Promise<void> {
    const content = `
      <a id="handle-callback" href="/" onclick="handleCallback(event)">Handle callback (Continue Login)</a>
      <hr/>
      ${homeLink(this)}
    `;
    return this.getSDKInstance({ subscribeAuthStateChange: false })
      .then(() => this._setContent(content))
      .then(() => this._afterRender('callback'));
  }

  async bootstrapHome(): Promise<void> {
    // Default home page
    return this.getSDKInstance()
      .then(() => this.render());
  }

  render(): Promise<void> {
    return this.oktaAuth.tokenManager.getTokens()
    .catch((e) => {
      this.renderError(e);
      throw e;
    })
    .then(data => this.appHTML(data))
    .then(content => this._setContent(content))
    .then(() => {
      // Add a special highlight on links when they are clicked
      const links = Array.prototype.slice.call(document.getElementsByTagName('a')) as Element[];
      links.forEach(link => {
        link.addEventListener('click', function() {
          this.classList.add('clicked');
        });
      });
      this._afterRender();
    });
  }

  renderError(e: Error): void {
    const xhrError = e && (e as any).xhr ? ((e as any).xhr.message || 'Network request failed') : '';
    this._setContent(`
      <div id="error" style="color: red">${e.toString()}</div>
      <div id="xhr-error" style="color: red">${xhrError}</div>
      <hr/>
      ${homeLink(this)}
      ${logoutLink(this)}
    `);
    this._afterRender('with-error');
  }

  loginWidget(): void {
    saveConfigToStorage(this.config);
    document.getElementById('modal').style.display = 'block';
    const config = window.getWidgetConfig();
    const signIn = new OktaSignIn(config);
  
    signIn.showSignInToGetTokens({
      clientId: config.clientId,
      redirectUri: config.redirectUri,  
      scope: ['openid', 'email', 'offline_access'],
  
      // Return an access token from the authorization server
      getAccessToken: true,
  
      // Return an ID token from the authorization server
      getIdToken: true,

      // Return a Refresh token from the authorization server
      getRefreshToken: true
    });
  }

  async loginDirect(): Promise<void> {
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    return this.oktaAuth.signIn({username, password})
    .then((res: AuthTransaction) => {
      if (res.status === 'SUCCESS') {
        saveConfigToStorage(this.config);
        return this.oktaAuth.token.getWithRedirect({
          sessionToken: res.sessionToken,
          responseType: this.config.responseType
        });
      }
    })
    .catch((e: Error) => {
      this.renderError(e);
      throw e;
    });
  }

  async loginRedirect(options: TokenParams): Promise<void> {
    saveConfigToStorage(this.config);
    options = Object.assign({}, {
      responseType: this.config.responseType,
      scopes: this.config._defaultScopes ? [] : this.config.scopes,
    }, options);
    return this.oktaAuth.token.getWithRedirect(options)
      .catch(e => {
        this.renderError(e);
        throw e;
      });
  }

  async loginPopup(options?: TokenParams): Promise<void> {
    options = Object.assign({}, {
      responseType: this.config.responseType,
      scopes: this.config._defaultScopes ? [] : this.config.scopes,
    }, options);
    return this.oktaAuth.token.getWithPopup(options)
    .then(res => {
      this.oktaAuth.tokenManager.setTokens(res.tokens);
      this.render();
    });
  }

  async getToken(options?: OktaAuthOptions): Promise<void> {
    options = Object.assign({}, {
      responseType: this.config.responseType,
      scopes: this.config._defaultScopes ? [] : this.config.scopes,
    }, options);
    return this.oktaAuth.token.getWithoutPrompt(options)
    .then(res => {
      this.oktaAuth.tokenManager.setTokens(res.tokens);
      this.render();
    });
  }

  async refreshSession(): Promise<object> {
    return this.oktaAuth.session.refresh();
  }

  async revokeToken(): Promise<void> {
    return this.oktaAuth.revokeAccessToken()
    .then(() => {
      document.getElementById('token-msg').innerHTML = 'access token revoked';
    });
  }

  async renewToken(): Promise<void> {
    return this.oktaAuth.tokenManager.renew('accessToken')
      .then(() => {
        this.render();
      });
  }

  async renewTokens(): Promise<void> {
    return this.oktaAuth.token.renewTokens()
      .then(() => {
        this.render();
      });
  }

  logoutRedirect(): void {
    this.oktaAuth.signOut()
      .catch(e => {
        console.error('Error during signout & redirect: ', e);
      });
  }

  async logoutXHR(): Promise<void>  {
    await this.oktaAuth.revokeAccessToken();
    this.oktaAuth.closeSession()
      .catch(e => {
        console.error('Error during signout & redirect: ', e);
      })
      .then(() => {
        window.location.reload();
      });
  }

  async logoutApp(): Promise<void>  {
    await this.oktaAuth.revokeAccessToken();
    this.oktaAuth.tokenManager.clear();
    window.location.reload();
  }

  async handleCallback(): Promise<void> {
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
  }

  async getTokensFromUrl(): Promise<TokenResponse> {
    // parseFromUrl() Will parse the authorization code from the URL fragment and exchange it for tokens
    const res = await this.oktaAuth.token.parseFromUrl();
    this.oktaAuth.tokenManager.setTokens(res.tokens);
    return res;
  }

  clearTokens(): void {
    this.oktaAuth.tokenManager.clear();
  }

  async getUserInfo(): Promise<void> {
    const { accessToken, idToken } = await this.oktaAuth.tokenManager.getTokens();
    if (accessToken && idToken) {
      return this.oktaAuth.token.getUserInfo(accessToken as AccessToken)
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
  }

  async testConcurrentGetToken(): Promise<void> {
    // Call getToken() but do not await the result
    const p1 = this.getToken().catch(error => {
      console.error('Saw error on the first request', error);
      this.renderError(error);
      throw error;
    });
    // Call getToken() again. If there is a concurrency issue, it will cause the first call to fail
    const p2 = this.getToken().catch(error => {
      console.error('Saw error on the second request', error);
      this.renderError(error);
      throw error;
    });
    return Promise.all([p1, p2])
      .then(() => {
        document.getElementById('token-msg').innerHTML = 'concurrent test passed';
      });
  }

  async testConcurrentLogin(): Promise<void> {
    // Call login but do not await the result
    const p1 = this.loginPopup().catch(error => {
      console.error('Saw error on the first request', error);
      this.renderError(error);
      throw error;
    });
    // Call login again. If there is a concurrency issue, it will cause the first call to fail
    const p2 = this.loginPopup().catch(error => {
      console.error('Saw error on the second request', error);
      this.renderError(error);
      throw error;
    });
    return Promise.all([p1, p2])
      .then(() => {
        document.getElementById('token-msg').innerHTML = 'concurrent test passed';
      });
  }

  // To test this, open another tab and logout from the Okta session
  // The token renew should fail, triggering an error event.
  // Two concurrent login attempts should then be running
  async testConcurrentLoginViaTokenRenewFailure(): Promise<void> {
    this.oktaAuth.tokenManager.on('error', () => {
      console.log('Received error event from TokenManager');
      this.loginPopup();
    });

    const accessToken = await this.oktaAuth.tokenManager.get('accessToken');
    accessToken.expiresAt = 0;
    this.oktaAuth.tokenManager.add('accessToken', accessToken);

    const freshToken = await this.oktaAuth.tokenManager.renew('accessToken');
    if (freshToken) {
      console.error('Token renew did not fail as expected');
    } else {
      console.log('Token renew failed as expected');
      this.loginPopup();
    }
  }

  configHTML(): string {
    const config = htmlString(this.config);
    return `
      <h2>Config</h2>
      ${ config }
    `;
  }

  appHTML(props: Tokens): string {
    const { idToken, accessToken, refreshToken } = props || {};
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
            <a id="renew-tokens" href="/" onclick="renewTokens(event)">Renew Tokens</a>
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
          <li>
            <a id="test-concurrent-get-token" href="/" onclick="testConcurrentGetToken(event)">Test Concurrent getToken</a>
          </li>
          <li>
            <a id="test-concurrent-login-via-token-renew-failure" href="/" onclick="testConcurrentLoginViaTokenRenewFailure(event)">Test Concurrent login via token renew failure</a>
          </li>
        </ul>
        <div id="user-info"></div>
        <hr/>
        ${ tokensHTML({idToken, accessToken, refreshToken})}
      `;
    }

    // Unauthenticated user, Login page
    return `
      <strong>Greetings, unknown user!</strong>
      <hr/>
      <ul>
        <li>
          <a id="login-widget" href="/" onclick="loginWidget(event)">Login using SIGNIN WIDGET</a>
        </li>
        <li>
          <a id="login-redirect" href="/" onclick="loginRedirect(event)">Login using REDIRECT</a>
        </li>
        <li>
          <a id="login-popup" href="/" onclick="loginPopup(event)">Login using POPUP</a>
        </li>
        <li>
         <a id="get-token" href="/" onclick="getToken(event)">Get Token (without prompt)</a>
        </li>
        <li>
          <a id="test-concurrent-login" href="/" onclick="testConcurrentLogin(event)">Test Concurrent Login</a>
        </li>
      </ul>
      <h4/>
      <input name="username" id="username" placeholder="username" type="email"/>
      <input name="password" id="password" placeholder="password" type="password"/>
      <a href="/" id="login-direct" onclick="loginDirect(event)">Login DIRECT</a>
      `;
  }

  callbackHTML(res: TokenResponse): string {
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
}

export default TestApp;
