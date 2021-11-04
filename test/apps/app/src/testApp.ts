/* eslint-disable max-depth */
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
  TokenParams,
  isInteractionRequired,
  isInteractionRequiredError, isAuthorizationCodeError,
  isEmailVerifyCallback,
  parseEmailVerifyCallback,
  IdxStatus,
  IdxTransaction,
} from '@okta/okta-auth-js';
import { saveConfigToStorage, flattenConfig, Config } from './config';
import { MOUNT_PATH } from './constants';
import { htmlString, toQueryString, makeClickHandler } from './util';
import { showConfigForm } from './form';
import { tokensHTML } from './tokens';
import { renderWidget } from './widget';

function homeLink(app: TestApp): string {
  return `<a id="return-home" href="${app.originalUrl}">Return Home</a>`;
}

function loginLinks(app: TestApp, onProtectedPage?: boolean): string {
  let protectedPageLink = '';
  if (!onProtectedPage) {
    protectedPageLink = `
      <li class="pure-menu-item">
        <a id="nav-to-protected" href="${app.protectedUrl}" class="pure-menu-link">Navigate to PROTECTED page</a>
      </li>
    `;
  }
  return `
    <div class="pure-menu">
      <ul class="pure-menu-list actions">
        <li class="pure-menu-item">
          <a id="login-widget" href="/" onclick="loginWidget(event)" class="pure-menu-link">Login using SIGNIN WIDGET</a>
        </li>
        <li class="pure-menu-item">
          <a id="login-redirect" href="/" onclick="loginRedirect(event)" class="pure-menu-link">Login using REDIRECT</a>
        </li>
        <li class="pure-menu-item">
          <a id="login-popup" href="/" onclick="loginPopup(event)" class="pure-menu-link">Login using POPUP</a>
        </li>
        <li class="pure-menu-item">
        <a id="get-token" href="/" onclick="getToken(event)" class="pure-menu-link">Get Token (without prompt)</a>
        </li>
        <li class="pure-menu-item">
          <a id="test-concurrent-login" href="/" onclick="testConcurrentLogin(event)" class="pure-menu-link">Test Concurrent Login</a>
        </li>
        ${protectedPageLink}
      </ul>
    </div>
    <div class="box">
      <form>
        <input name="username" id="username" placeholder="username" type="email"/>
        <input name="password" id="password" placeholder="password" type="password"/>
        <a href="/" id="login-direct" onclick="loginDirect(event)">Login DIRECT</a>
      </form>
    </div>
  `;
}

function logoutLink(app: TestApp): string {
  return `
    <div class="actions signout pure-menu">
      <ul class="pure-menu-list">
        <li class="pure-menu-item">
          <a id="logout-redirect" href="${app.originalUrl}" onclick="logoutRedirect(event)" class="pure-menu-link">Logout (and redirect here)</a>
        </li>
        <li class="pure-menu-item">
          <a id="logout-xhr" href="${app.originalUrl}" onclick="logoutXHR(event)" class="pure-menu-link">Logout (XHR + reload)</a>
        </li>
        <li class="pure-menu-item">
          <a id="logout-app" href="${app.originalUrl}" onclick="logoutApp(event)" class="pure-menu-link">Logout (app only)</a>
        </li>
      </ul>
    </div>
  `;
}

const Toolbar = `
  <div class="actions subscribe pure-menu pure-menu-horizontal">
    <ul class="pure-menu-list">
      <li class="pure-menu-item">
        <a id="start-service" onclick="startService(event)" class="pure-menu-link">Start service</a>
      </li>
      <li class="pure-menu-item">
        <a id="stop-service" onclick="stopService(event)" class="pure-menu-link">Stop service</a>
      </li>
      <li class="pure-menu-item">
        <a id="subscribe-auth-state" onclick="subscribeToAuthState(event)" class="pure-menu-link">Subscribe to AuthState</a>
      </li>
      <li class="pure-menu-item">
        <a id="subscribe-token-events" onclick="subscribeToTokenEvents(event)" class="pure-menu-link">Subscribe to TokenManager events</a>
      </li>
  </div>
`;

const Layout = `
  <div id="layout">
    <div id="session-expired" style="color: orange"></div>
    <div id="token-error" style="color: red"></div>
    <div id="token-msg" style="color: green"></div>
    ${Toolbar}
    <div id="page-content"></div>
  </div>
`;

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
    revokeRefreshToken: testApp.revokeRefreshToken.bind(testApp),
    handleCallback: testApp.handleCallback.bind(testApp),
    getUserInfo: testApp.getUserInfo.bind(testApp),
    testConcurrentGetToken: testApp.testConcurrentGetToken.bind(testApp),
    testConcurrentLogin: testApp.testConcurrentLogin.bind(testApp),
    testConcurrentLoginViaTokenRenewFailure: testApp.testConcurrentLoginViaTokenRenewFailure.bind(testApp),
    subscribeToAuthState: testApp.subscribeToAuthState.bind(testApp),
    subscribeToTokenEvents: testApp.subscribeToTokenEvents.bind(testApp),
    startService: testApp.startService.bind(testApp),
    stopService: testApp.stopService.bind(testApp),
  };
  Object.keys(boundFunctions).forEach(functionName => {
    (window as any)[functionName] = makeClickHandler((boundFunctions as any)[functionName]);
  });
}

class TestApp {
  config: Config;
  originalUrl?: string;
  protectedUrl?: string;
  rootElem?: Element;
  contentElem?: Element;
  oktaAuth?: OktaAuth;
  getCount?: number;
  widgetInstance?: unknown;

  constructor(config: Config) {
    this.config = config;
    this.getCount = 0;
  }

  // Mount into the DOM
  mount(window: Window, rootElem: Element): void {
    const queryParams = toQueryString(flattenConfig(this.config));
    this.originalUrl = MOUNT_PATH + queryParams;
    this.protectedUrl = MOUNT_PATH + 'protected/' + queryParams;
    this.rootElem = rootElem;
    this.rootElem.innerHTML = Layout;
    this.contentElem = document.getElementById('page-content');
    bindFunctions(this, window);
    showConfigForm(this.config);
  }

  getSDKInstance(): OktaAuth {
    // can throw
    this.oktaAuth = this.oktaAuth || new OktaAuth(Object.assign({}, this.config, {
      scopes: this.config.defaultScopes ? [] : this.config.scopes
    }));
    return this.oktaAuth;
  }

  startService(): void {
    this.oktaAuth.start();
  }

  stopService(): void {
    this.oktaAuth.stop();
  }

  subscribeToAuthState(): void {
    this.oktaAuth.authStateManager.subscribe(() => {
      console.log('new AuthState', this.oktaAuth.authStateManager.getAuthState());
      this.render();
    });
  }

  subscribeToTokenEvents(): void {
    ['expired', 'renewed', 'added', 'removed'].forEach(event => {
      this.oktaAuth.tokenManager.on(event, (arg1: unknown, arg2?: unknown) => {
        console.log(`TokenManager::${event}`, arg1, arg2);
      });
    });
    this.oktaAuth.tokenManager.on('error', (err: unknown) => {
      console.log('TokenManager::error', err);
      this._onTokenError(err);
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

  _onTokenError(error: unknown): void {
    document.getElementById('token-error').innerText = error as string;
  }

  async bootstrapProtected(): Promise<void> {
    this.getSDKInstance();
    const { idToken, accessToken } = this.oktaAuth.tokenManager.getTokensSync();
    let content;
    if (idToken || accessToken) {
      content = `
        ${homeLink(this)}
        <hr/>
        <strong>You are authenticated</strong>
      `;
    } else {
      content = `
        ${homeLink(this)}
        <hr/>
        <strong>You are NOT authenticated. Login using one of these methods:</strong>
        ${loginLinks(this, true)}
      `;
      this.config.state = 'protected-route-' + Math.round(Math.random() * 1000);
      this.oktaAuth.setOriginalUri(this.protectedUrl, this.config.state);
    }

    this._setContent(content);
    this._afterRender('protected');
  }

  bootstrapCallback(): void {
    const content = `
      <a id="handle-callback" href="/" onclick="handleCallback(event)">Handle callback (Continue Login)</a>
      <hr/>
      ${homeLink(this)}
    `;
    this.getSDKInstance(/*{ subscribeAuthStateChange: false }*/);
    this._setContent(content);
    this._afterRender('callback');
  }

  async bootstrapHome(): Promise<void> {
    // Default home page
    this.getSDKInstance();
    this.oktaAuth.removeOriginalUri();
    return this.render();
  }

  render(forceUnauth = false): Promise<void> {
    const p = forceUnauth ? Promise.resolve({}) : this.oktaAuth.tokenManager.getTokens();
    return p.catch((e) => {
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

  async loginWidget(): Promise<void> {
    this.config.state = 'widget-login-' + Math.round(Math.random() * 1000);
    saveConfigToStorage(this.config);
    return this.renderWidget();
  }

  async renderWidget(options?: any): Promise<void> {
    const tokens: Tokens = await renderWidget(this.config, this.oktaAuth, options);

    // save tokens
    this.oktaAuth.tokenManager.setTokens(tokens);

    // shared storage can be cleared now
    this.oktaAuth.transactionManager.clear({ clearSharedStorage: true, state: options?.state });

    // re-render
    this.render();
  }

  async loginDirect(): Promise<void> {
    // Make sure we are starting a fresh transaction
    this.oktaAuth.storageManager.getTransactionStorage().clearStorage();

    // username and password may be empty, in which case SSO login will be attempted
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    const { useInteractionCodeFlow } = this.config;
    let tokens;
    if (useInteractionCodeFlow) {
      tokens = await this.getTokensDirectOIE(username, password);
    } else {
      // V1 flow
      tokens = await this.getTokensDirectV1(username, password);
    }

    if (tokens) {
      this.oktaAuth.tokenManager.setTokens(tokens);
    }

    await this.render();
  }

  async getTokensDirectOIE(username: string, password: string): Promise<Tokens>  {
    let tokens;
    const idxTransaction: IdxTransaction = await this.oktaAuth.idx.authenticate({ username, password });
    if (idxTransaction.status === IdxStatus.SUCCESS) {
      tokens = idxTransaction.tokens;
    } else {
      this.renderError(new Error(JSON.stringify(idxTransaction.error)));
    }
    return tokens;
  }

  async getTokensDirectV1(username: string, password: string): Promise<Tokens>  {
    let sessionToken;
    let tokens;
    if (username || password) {
      const v1Transaction: AuthTransaction = await this.oktaAuth.signIn({ username, password });
      if (v1Transaction.status === 'SUCCESS') {
        sessionToken = v1Transaction.sessionToken;
      } else {
        this.renderError(new Error(`Transaction returned status: ${v1Transaction.status}`));
      }
    }
    // No username or password? try getWithoutPrompt
    const res = await this.oktaAuth.token.getWithoutPrompt({
      sessionToken
    });
    if (res.tokens) {
      tokens = res.tokens;
    } else {
      this.renderError(new Error('Tokens were not returned in response: ' + JSON.stringify(res)));
    }
    return tokens;
  }

  async loginRedirect(options: TokenParams): Promise<void> {
    this.config.state = this.config.state || 'login-redirect' + Math.round(Math.random() * 1000);
    saveConfigToStorage(this.config);
    options = Object.assign({}, {
      responseType: this.config.responseType,
      scopes: this.config.defaultScopes ? [] : this.config.scopes,
      state: this.config.state
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
      scopes: this.config.defaultScopes ? [] : this.config.scopes,
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
      scopes: this.config.defaultScopes ? [] : this.config.scopes,
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

  async revokeRefreshToken(): Promise<void> {
    return this.oktaAuth.revokeRefreshToken()
    .then(() => {
      document.getElementById('token-msg').innerHTML = 'refresh token revoked';
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
      .then(tokens => {
        this.oktaAuth.tokenManager.setTokens(tokens);
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
    if (isInteractionRequired(this.oktaAuth)) {
      return this.renderInteractionRequired();
    }

    if (isEmailVerifyCallback(window.location.search)) {
      return this.renderEmailVerifyCallback();
    }

    return this.getTokensFromUrl()
      .then(res => {
        return this.renderCallback(res);
      }, e => {
        // we will not see this if we are intercepting interaction_required earlier
        if (isInteractionRequiredError(e)) {
          return this.renderInteractionRequired();
        }
        if (isAuthorizationCodeError(this.oktaAuth, e)){
          e.xhr.message = 'Authorization code is invalid or expired.';
        }
        this.renderError(e);
        throw e;
      });
  }

  async renderCallback(res: TokenResponse): Promise<void> {
    return Promise.resolve(this.callbackHTML(res))
      .then(content => this._setContent(content))
      .then(() => this._afterRender('callback-handled'));
  }

  // Renders the login widget
  async renderInteractionRequired(): Promise<void> {
    return this.render(true).then(() => this.renderWidget());
  }

  async renderEmailVerifyCallback(): Promise<void> {
    const { state, stateTokenExternalId } = parseEmailVerifyCallback(window.location.search);
    await this.render(true);
    return this.renderWidget({ state, stateTokenExternalId });
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
        <div class="pure-g">
          <div class="pure-u-1-2">
            <div class="actions authenticated pure-menu">
              <ul class="pure-menu-list">
                <li class="pure-menu-item">
                  <a id="get-userinfo" href="/" onclick="getUserInfo(event)" class="pure-menu-link">Get User Info</a>
                </li>
                <li class="pure-menu-item">
                  <a id="renew-token" href="/" onclick="renewToken(event)" class="pure-menu-link">Renew Token</a>
                </li>
                <li class="pure-menu-item">
                  <a id="renew-tokens" href="/" onclick="renewTokens(event)" class="pure-menu-link">Renew Tokens</a>
                </li>
                <li class="pure-menu-item">
                  <a id="get-token" href="/" onclick="getToken(event)" class="pure-menu-link">Get Token (without prompt)</a>
                </li>
                <li class="pure-menu-item"> 
                  <a id="clear-tokens" href="/" onclick="clearTokens(event)" class="pure-menu-link">Clear Tokens</a>
                </li>
                <li class="pure-menu-item">
                  <a id="revoke-token" href="/" onclick="revokeToken(event)" class="pure-menu-link">Revoke Access Token</a>
                </li>
                <li class="pure-menu-item">
                  <a id="revoke-refresh-token" href="/" onclick="revokeRefreshToken(event)" class="pure-menu-link">Revoke Refresh Token</a>
                </li>
                <li class="pure-menu-item">
                  <a id="refresh-session" href="/" onclick="refreshSession(event)" class="pure-menu-link">Refresh Session</a>
                </li>
                <li class="pure-menu-item">
                  <a id="test-concurrent-get-token" href="/" onclick="testConcurrentGetToken(event)" class="pure-menu-link">Test Concurrent getToken</a>
                </li>
                <li class="pure-menu-item">
                  <a id="test-concurrent-login-via-token-renew-failure" href="/" onclick="testConcurrentLoginViaTokenRenewFailure(event)" class="pure-menu-link pure-menu-item">Test Concurrent login via token renew failure</a>
                </li>
              </ul>
            </div>
          </div>
          <div class="pure-u-1-2">
            ${logoutLink(this)}
          </div>
        </div>
        <div id="user-info"></div>
        <hr/>
        ${ tokensHTML({idToken, accessToken, refreshToken})}
      `;
    }

    // Unauthenticated user, Login page
    return `
      <div class="box">
      <strong>Greetings, unknown user!</strong>
      </div>
      ${loginLinks(this)}
      `;
  }

  callbackHTML(res: TokenResponse): string {
    const tokensReceived = res.tokens ? Object.keys(res.tokens): [];
    const success = res.tokens && tokensReceived.length;
    const errorMessage = success ? '' :  'Tokens not returned. Check error console for more details';
    const successMessage = success ?
      'Successfully received tokens on the callback page: ' + tokensReceived.join(', ') : '';
    const originalUri = this.oktaAuth.getOriginalUri(res.state);
    const content = `
      <div id="callback-result">
        <strong><div id="success">${successMessage}</div></strong>
        <div id="error">${errorMessage}</div>
        <div id="xhr-error"></div>
        <div id="res-state">State: <strong>${res.state}</strong></div>
        <div id="original-uri">Original Uri: <a href="${originalUri}">${originalUri}</a></div>
      </div>
      <hr/>
      ${homeLink(this)}
      ${ success ? tokensHTML(res.tokens): '' }
    `;
    return content;
  }
}

export default TestApp;
