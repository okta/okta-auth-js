/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


import assert from 'assert';
import toQueryString from '../util/toQueryString';

/* eslint-disable max-len */
class TestApp {
  get rootSelector() { return $('#root'); }
  get readySelector() { return $('#root.rendered.loaded'); }
  get landingSelector() { return $('body.oidc-app.landing'); }
  get isAuthenticatedText() { return $('#is-authenticated'); }

  // Authenticated landing
  get logoutRedirectBtn() { return $('#logout-redirect'); }
  get logoutRedirectClearTokensAfterRedirectBtn() { return $('#logout-redirect-clear-tokens-after-redirect'); }
  get logoutXHRBtn() { return $('#logout-xhr'); }
  get logoutAppBtn() { return $('#logout-app'); }
  get renewTokenBtn() { return $('#renew-token'); }
  get renewTokensBtn() { return $('#renew-tokens'); }
  get revokeTokenBtn() { return $('#revoke-token'); }
  get revokeRefreshTokenBtn() { return $('#revoke-refresh-token'); }
  get getTokenBtn() { return $('#get-token'); }
  get clearTokensBtn() { return $('#clear-tokens'); }
  get getUserInfoBtn() { return $('#get-userinfo'); }
  get getSessionInfoBtn() { return $('#get-session'); }
  get userInfo() { return $('#user-info'); }
  get sessionInfo() { return $('#session-info'); }
  get sessionExpired() { return $('#session-expired'); }
  get testConcurrentGetTokenBtn() { return $('#test-concurrent-get-token'); }
  get loginWithAcrBtn() { return $('#login-acr'); }
  get enrollAuthenticator() { return $('#enroll-authenticator'); }

  get tokenError() { return $('#token-error'); }
  get tokenMsg() { return $('#token-msg'); }
  get authStatusText() { return $('#auth-status-text'); }
  
  // Unauthenticated landing
  get loginWidgetBtn() { return $('#login-widget'); }
  get loginRedirectBtn() { return $('#login-redirect'); }
  get loginPopupBtn() { return $('#login-popup'); }
  get loginDirectBtn() { return $('#login-direct'); }
  get username() { return $('#username'); }
  get password() { return $('#password'); }
  get testConcurrentLoginBtn() { return $('#test-concurrent-login'); }
  get navigateToProtectedBtn() { return $('#nav-to-protected'); }

  // Form
  get responseModeQuery() { return $('#f_responseMode [value="query"]'); }
  get responseModeFragment() { return $('#f_responseMode [value="fragment"]'); }
  get pkceOptionOn() { return $('#f_pkce-on'); }
  get pkceOptionOff() { return $('#f_pkce-off'); }
  get clientId() { return $('#f_clientId'); }
  get issuer() { return $('#f_issuer'); }
  get interactionCodeOption() { return $('#f_useInteractionCodeFlow-on'); }
  get acrValues() { return $('#f_acrValues'); }
  get enrollAmrValues() { return $('#f_enroll_amr_values'); }
  get submit() { return $('#f_submit'); }

  // Callback
  get callbackSelector() { return $('#root.rendered.loaded.callback'); }
  get callbackHandledSelector() { return $('#root.callback-handled'); }
  get callbackOriginalUri() { return $('#original-uri > a'); }
  
  // Toolbar
  get subscribeAuthStateBtn() { return $('#subscribe-auth-state'); }
  get subscribeTokenEventsBtn() { return $('#subscribe-token-events'); }
  get startServiceBtn() { return $('#start-service'); }
  get handleCallbackBtn() { return $('#handle-callback'); }
  get callbackResult() { return $('#callback-result'); }
  get returnHomeBtn() { return $('#return-home'); }
  get accessToken() { return $('#access-token'); }
  get idToken() { return $('#id-token'); }
  get refreshToken() { return $('#refresh-token'); }
  get success() { return $('#success'); }
  get error() { return $('#error'); }
  get xhrError() { return $('#xhr-error'); }

  // Widget
  get signinWidget() { return $('#widget .primary-auth'); }
  
  async open(queryObj, openInNewWindow) {
    const qs = toQueryString(queryObj);
    if (openInNewWindow) {
      await browser.newWindow(qs, { windowFeatures: 'noopener=yes' });
    } else {
      await browser.url('/' + qs);
    }
    await browser.waitUntil(async () => this.readySelector.then(el => el.isExisting()), 5000, 'wait for ready selector');
  }

  async isAuthenticated() {
    await this.waitForIsAuthenticatedText();
    const isAuthenticatedText = (await (await this.isAuthenticatedText).getText()).trim();
    return isAuthenticatedText === 'Authenticated';
  }

  async showLoginWidget() {
    await this.waitForLoginBtn();
    await this.loginWidgetBtn.then(el => el.click());
  }

  async loginRedirect() {
    await this.waitForLoginBtn();
    await this.loginRedirectBtn.then(el => el.click());
  }

  async handleCallback() {
    await this.waitForCallback();
    await browser.waitUntil(async () => this.handleCallbackBtn.then(el => el.isDisplayed()), 5000, 'wait for handle callback btn');
    await this.handleCallbackBtn.then(el => el.click());
  }

  async loginPopup() {
    await this.waitForLoginBtn();
    var btn = await this.loginPopupBtn;
    await btn.click();
  }

  async loginDirect() {
    await this.waitForLoginBtn();
    await this.loginDirectBtn.then(el => el.click());
  }

  async navigateToProtectedPage() {
    const btn = await this.navigateToProtectedBtn;
    await btn.click(); 
  }

  // renew the accessToken, using refreshToken if available
  async renewToken() {
    const btn = await this.renewTokenBtn;
    await btn.click();
  }

  // renew all tokens, using refreshToken if available
  async renewTokens() {
    const btn = await this.renewTokensBtn;
    await btn.click();
  }

  // get all tokens using getWithoutPrompt. Requires 3rd-party cookies
  async getToken() {
    return this.getTokenBtn.then(el => el.click());
  }

  async clearTokens() {
    return this.clearTokensBtn.then(el => el.click());
  }

  async revokeToken() {
    return this.revokeTokenBtn.then(el => el.click());
  }

  async revokeRefreshToken() {
    return this.revokeRefreshTokenBtn.then(el => el.click());
  }

  async getUserInfo() {
    await browser.waitUntil(async () => {
      const el = await this.getUserInfoBtn;

      // Facing an issue where click sometimes does not work without using browser.pause to add a delay
      // Clicking directly in javascript solves the issue.
      // It may be related to webdriver logic which is to scroll to the element.
      if (el.isDisplayed()) {
        await browser.execute('arguments[0].click();', el);
        return true;
      }
    }, 5000, 'wait for get user info btn');
  }

  async getSessionInfo() {
    await browser.waitUntil(async () => {
      const el = await this.getSessionInfoBtn;

      if (el.isDisplayed()) {
        await browser.execute('arguments[0].click();', el);
        return true;
      }
    }, 5000, 'wait for get session info btn');
  }

  async getIdToken() {
    return this.idToken.then(el => el.getText()).then(txt => {
      try {
        return JSON.parse(txt);
      } catch (_) {
        return null;
      }
    });
  }

  async getAccessToken() {
    return this.accessToken.then(el => el.getText()).then(txt => {
      try {
        return JSON.parse(txt);
      } catch (_) {
        return null;
      }
    });
  }

  async returnHome() {
    await browser.waitUntil(async () => this.returnHomeBtn.then(el => el.isDisplayed()));
    await this.returnHomeBtn.then(el => el.click());
    await browser.waitUntil(async () => this.landingSelector.then(el => el.isDisplayed()));
    await browser.waitUntil(async () => this.readySelector.then(el => el.isExisting()), 5000, 'wait for ready selector');
  }

  async logoutRedirect(options = {}) {
    if (options.clearTokensAfterRedirect) {
      const url = await browser.getUrl();
      await this.logoutRedirectClearTokensAfterRedirectBtn.then(el => el.click());
      await browser.waitUntil(async () => {
        const newUrl = await browser.getUrl();
        return newUrl !== url;
      });
      await this.subscribeToAuthState();
      await this.startService();
    } else {
      await this.logoutRedirectBtn.then(el => el.click());
    }
    await this.waitForLoginBtn();
  }

  async logoutXHR() {
    await this.logoutXHRBtn.then(el => el.click());
    await this.waitForLoginBtn();
  }

  async logoutApp() {
    await this.logoutAppBtn.then(el => el.click());
    await this.waitForLoginBtn();
  }

  async startService() {
    await this.startServiceBtn.then(el => el.click());
  }
  
  async subscribeToAuthState() {
    await this.subscribeAuthStateBtn.then(el => el.click());
  }

  async subscribeToTokenEvents() {
    await this.subscribeTokenEventsBtn.then(el => el.click());
  }

  async testConcurrentLogin() {
    await this.testConcurrentLoginBtn.then(el => el.click());
  }

  async testConcurrentGetToken() {
    await this.testConcurrentGetTokenBtn.then(el => el.click());
  }

  async selectPkceOptionOff(){
    await this.pkceOptionOff.then(el=> el.click());
  }

  async waitForIsAuthenticatedText() {
    return browser.waitUntil(async () => this.isAuthenticatedText.then(el => el.isDisplayed()), 5000, 'wait for is authenticated text');
  }

  async waitForLoginBtn() {
    return browser.waitUntil(async () => this.loginRedirectBtn.then(el => el.isDisplayed()), 5000, 'wait for login button');
  }

  async waitForLogoutBtn() {
    return browser.waitUntil(async () => this.logoutRedirectBtn.then(el => el.isDisplayed()), 15000, 'wait for logout button');
  }

  async waitForCallback() {
    return browser.waitUntil(async () => this.callbackSelector.then(el => el.isExisting()), 5000, 'wait for callback');
  }

  async waitForCallbackResult() {
    return browser.waitUntil(async () => this.callbackHandledSelector.then(el => el.isExisting()), 5000, 'wait for callback result');
  }

  async waitForUserInfo() {
    return browser.waitUntil(async () => this.userInfo.then(el => el.isDisplayed()), 5000, 'wait for user info');
  }

  async waitForSessionInfo() {
    return browser.waitUntil(async () => this.sessionInfo.then(el => el.isDisplayed()), 5000, 'wait for session info');
  }

  async waitForSigninWidget() {
    return browser.waitUntil(async () => this.signinWidget.then(el => el.isDisplayed()), 5000, 'wait for signin widget');
  }

  async waitForIdTokenRenew() {
    const currIdToken = await this.getIdToken();
    return browser.waitUntil(async () => {
      const newIdToken = await this.getIdToken();
      if (currIdToken.idToken !== newIdToken.idToken && newIdToken.idToken) {
        console.log('see that the ID token has changed, renew successful');
        return true;
      }
      console.log('still waiting for ID token renew...');
    }, 30000, 'wait for id_token renew');
  }

  async waitForAccessTokenRenew() {
    const currAccessToken = await this.getAccessToken();
    return browser.waitUntil(async () => {
      const newAccessToken = await this.getAccessToken();
      if (currAccessToken.accessToken !== newAccessToken.accessToken && newAccessToken.accessToken) {
        console.log('see that the access token has changed, renew successful');
        return true;
      }
      console.log('still waiting for access token renew...');
    }, 10000, 'wait for access_token renew');
  }

  async assertCallbackSuccess() {
    await this.waitForCallbackResult();
    await this.success.then(el => el.getText()).then(txt => {
      assert(txt !== '');
    });
    await this.error.then(el => el.getText()).then(txt => {
      assert(txt === '');
    });
    await this.xhrError.then(el => el.getText()).then(txt => {
      assert(txt === '');
    });
    await this.accessToken.then(el => el.getText()).then(txt => {
      assert(txt.indexOf('expiresAt') > 0);
    });
    await this.idToken.then(el => el.getText()).then(txt => {
      assert(txt.indexOf('claims') > 0);
    });
  }

  async assertLoggedIn() {
    await this.waitForLogoutBtn();
    await this.accessToken.then(btn => btn.getText()).then(txt => {
      assert(txt.indexOf('expiresAt') > 0);
    });
    await this.idToken.then(btn => btn.getText()).then(txt => {
      assert(txt.indexOf('claims') > 0);
    });
  }

  async assertLoggedOut() {
    await this.waitForLoginBtn();
  }

  async assertUserInfo() {
    await this.waitForUserInfo();
    await this.userInfo.then(el => el.getText()).then(txt => {
      assert(txt.indexOf('email') > 0);
    });
  }

  async assertSessionExists() {
    await this.waitForSessionInfo();
    await this.sessionInfo.then(el => el.getText()).then(txt => {
      assert(txt.indexOf('"ACTIVE"') > 0);
    });
  }

  async assertSessionNotExists() {
    await this.waitForSessionInfo();
    await this.sessionInfo.then(el => el.getText()).then(txt => {
      assert(txt.indexOf('"INACTIVE"') > 0);
    });
  }

  async assertIdToken() {
    await this.idToken.then(el => el.getText()).then(txt => {
      assert(txt.indexOf('claims') > 0);
    });
  }

  async assertTokenMessage(msg) {
    await browser.waitUntil(async () => {
      const txt = await this.tokenMsg.then(el => el.getText());
      return txt !== '';
    }, 10000, 'wait for token message');
    const txt = await this.tokenMsg.then(el => el.getText());
    assert(txt === msg);
  }

  async assertAuthStatusText(msg) {
    await browser.waitUntil(async () => {
      const txt = await this.authStatusText.then(el => el.getText());
      return txt !== '';
    }, 10000, 'wait for auth status text');
    const txt = await this.authStatusText.then(el => el.getText());
    assert(txt.includes(msg));
  }

  async assertIssuer(issuer) {
    await this.issuer.then(el => el.getText()).then(txt => {
      assert(txt === issuer);
    });
  }
}

export default new TestApp();
