import assert from 'assert';
import toQueryParams from '../util/toQueryParams';

/* eslint-disable max-len */
class TestApp {
  get rootSelector() { return $('#root'); }
  get readySelector() { return $('#root.rendered.loaded'); }
  get landingSelector() { return $('body.oidc-app.landing'); }

  // Authenticated landing
  get logoutRedirectBtn() { return $('#logout-redirect'); }
  get logoutXHRBtn() { return $('#logout-xhr'); }
  get logoutAppBtn() { return $('#logout-app'); }
  get renewTokenBtn() { return $('#renew-token'); }
  get revokeTokenBtn() { return $('#revoke-token'); }
  get getTokenBtn() { return $('#get-token'); }
  get clearTokensBtn() { return $('#clear-tokens'); }
  get getUserInfoBtn() { return $('#get-userinfo'); }
  get userInfo() { return $('#user-info'); }
  get sessionExpired() { return $('#session-expired'); }

  get tokenError() { return $('#token-error'); }
  get tokenMsg() { return $('#token-msg'); }

  // Unauthenticated landing
  get loginRedirectBtn() { return $('#login-redirect'); }
  get loginPopupBtn() { return $('#login-popup'); }
  get loginDirectBtn() { return $('#login-direct'); }
  get username() { return $('#username'); }
  get password() { return $('#password'); }

  // Form
  get responseModeQuery() { return $('#responseMode [value="query"]'); }
  get responseModeFragment() { return $('#responseMode [value="fragment"]'); }
  get pkceOption() { return $('#pkce-on'); }
  get clientId() { return $('#clientId'); }
  get issuer() { return $('#issuer'); }

  // Callback
  get callbackSelector() { return $('#root.callback'); }
  get callbackHandledSelector() { return $('#root.callback-handled'); }

  get handleCallbackBtn() { return $('#handle-callback'); }
  get callbackResult() { return $('#callback-result'); }
  get returnHomeBtn() { return $('#return-home'); }
  get accessToken() { return $('#access-token'); }
  get idToken() { return $('#id-token'); }
  get success() { return $('#success'); }
  get error() { return $('#error'); }
  get xhrError() { return $('#xhr-error'); }

  async open(queryObj) {
    await browser.url(toQueryParams(queryObj));
    await browser.waitUntil(async () => this.readySelector.then(el => el.isExisting()), 5000, 'wait for ready selector');
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

  async renewToken() {
    const btn = await this.renewTokenBtn;
    await btn.click();
  }

  async getToken() {
    return this.getTokenBtn.then(el => el.click());
  }

  async clearTokens() {
    return this.clearTokensBtn.then(el => el.click());
  }

  async revokeToken() {
    return this.revokeTokenBtn.then(el => el.click());
  }

  async getUserInfo() {
    await browser.waitUntil(async () => this.getUserInfoBtn.then(el => el.isDisplayed()));
    await this.getUserInfoBtn.then(el => el.click());
  }

  async returnHome() {
    await browser.waitUntil(async () => this.returnHomeBtn.then(el => el.isDisplayed()));
    await this.returnHomeBtn.then(el => el.click());
    await browser.waitUntil(async () => this.landingSelector.then(el => el.isDisplayed()));
  }

  async logoutRedirect() {
    await this.logoutRedirectBtn.then(el => el.click());
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

  async assertUserInfo() {
    await this.waitForUserInfo();
    await this.userInfo.then(el => el.getText()).then(txt => {
      assert(txt.indexOf('email') > 0);
    });
  }

  async assertIdToken() {
    await this.idToken.then(el => el.getText()).then(txt => {
      assert(txt.indexOf('claims') > 0);
    });
  }

}

export default new TestApp();
