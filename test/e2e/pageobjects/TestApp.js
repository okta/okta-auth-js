import assert from 'assert';
import toQueryParams from '../util/toQueryParams';

class TestApp {
  get rootSelector() { return $('#root'); }
  get readySelector() { return $('#root.rendered.loaded'); }
  get landingSelector() { return $('body.oidc-app.landing'); }

  // Authenticated landing
  get logoutBtn() { return $('#logout'); }
  get renewTokenBtn() { return $('#renew-token'); }
  get getTokenBtn() { return $('#get-token'); }
  get getUserInfoBtn() { return $('#get-userinfo'); }
  get userInfo() { return $('#user-info'); }

  // Unauthenticated landing
  get loginRedirectBtn() { return $('#login-redirect'); }
  get loginPopupBtn() { return $('#login-popup'); }
  get loginDirectBtn() { return $('#login-direct'); }
  get username() { return $('#username'); }
  get password() { return $('#password'); }

  // Form
  get pkceOption() { return $('#pkce'); }
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

  open(queryObj) {
    browser.url(toQueryParams(queryObj));
    browser.waitUntil(() => this.readySelector.isExisting());
  }

  loginRedirect() {
    this.waitForLoginBtn();
    this.loginRedirectBtn.click();
  }

  handleCallback() {
    this.waitForCallback();
    browser.waitUntil(() => this.handleCallbackBtn.isClickable());
    this.handleCallbackBtn.click();
  }

  loginPopup() {
    this.waitForLoginBtn();
    this.loginPopupBtn.click();
  }

  loginDirect() {
    this.waitForLoginBtn();
    this.loginDirectBtn.click();
  }

  renewToken() {
    this.renewTokenBtn.click();
  }

  getToken() {
    this.getTokenBtn.click();
  }

  getUserInfo() {
    browser.waitUntil(() => this.getUserInfoBtn.isClickable());
    this.getUserInfoBtn.click();
  }

  returnHome() {
    browser.waitUntil(() => this.returnHomeBtn.isClickable());
    this.returnHomeBtn.click();
    if(!this.landingSelector.isDisplayed()){
      this.landingSelector.waitForDisplayed(5000);
    }
  }

  logout() {
    this.logoutBtn.click();
    this.waitForLoginBtn();
  }

  waitForLoginBtn() {
    if(!this.loginRedirectBtn.isDisplayed()){
      this.loginRedirectBtn.waitForDisplayed(5000);
    }
  }

  waitForLogoutBtn() {
    if(!this.logoutBtn.isDisplayed()){
      this.logoutBtn.waitForDisplayed(5000);
    }
  }

  waitForCallback() {
    browser.waitUntil(() => this.callbackSelector.isExisting());
  }

  waitForCallbackResult() {
    browser.waitUntil(() => this.callbackHandledSelector.isExisting());
  }

  waitForUserInfo() {
    if(!this.userInfo.isDisplayed()){
      this.userInfo.waitForDisplayed(10000);
    }
  }
  assertCallbackSuccess() {
    this.waitForCallbackResult();
    assert(this.success.getText() !== '');
    assert(this.error.getText() === '');
    assert(this.xhrError.getText() === '');
    assert(this.accessToken.getText().indexOf('expiresAt') > 0);
    assert(this.idToken.getText().indexOf('claims') > 0);
  }

  assertLoggedIn() {
    this.waitForLogoutBtn();
    assert(this.accessToken.getText().indexOf('expiresAt') > 0);
    assert(this.idToken.getText().indexOf('claims') > 0);
  }

  assertUserInfo() {
    this.waitForUserInfo();
    assert(this.userInfo.getText().indexOf('email') > 0);
  }
}

export default new TestApp();
