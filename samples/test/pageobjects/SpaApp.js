import assert from 'assert';
import toQueryParams from '../util/toQueryParams';

/* eslint-disable max-len */
class SpaApp {

  // Authenticated landing
  get logoutRedirectBtn() { return $('#logout-redirect'); }
  get getUserInfoBtn() { return $('#get-user-info'); }
  get userInfo() { return $('#userInfo'); }

  // Unauthenticated landing
  get loginRedirectBtn() { return $('#login-redirect'); }
  get username() { return $('#username'); }
  get password() { return $('#password'); }
  get signinFormSubmit() { return $('#login-direct'); }

  // Form
  get configForm() { return $('#config-form'); }
  get clientId() { return $('#clientId'); }
  get issuer() { return $('#issuer'); }

  // Callback}
  get returnHomeBtn() { return $('#return-home'); }
  get accessToken() { return $('#accessToken'); }
  get idToken() { return $('#idToken'); }
  get error() { return $('#error'); }

  async open(queryObj) {
    await browser.url(toQueryParams(queryObj));
    await this.waitForNoConfigForm();
  }

  async loginRedirect() {
    await this.waitForLoginBtn();
    await this.loginRedirectBtn.then(el => el.click());
  }

  async getUserInfo() {
    await browser.waitUntil(async () => this.getUserInfoBtn.then(el => el.isDisplayed()));
    await this.getUserInfoBtn.then(el => el.click());
  }

  async returnHome() {
    await browser.waitUntil(async () => this.returnHomeBtn.then(el => el.isDisplayed()));
    await this.returnHomeBtn.then(el => el.click());
  }

  async loginDirect() {
    await this.signinFormSubmit.then(el => el.click());
  }

  async logoutRedirect() {
    await this.logoutRedirectBtn.then(el => el.click());
    await this.waitForConfigForm();
  }

  async waitForConfigForm() {
    return browser.waitUntil(async () => this.configForm.then(el => el.isDisplayed()), 5000, 'wait for config form');
  }

  async waitForNoConfigForm() {
    return browser.waitUntil(async () => this.configForm.then(el => el.isDisplayed()).then(isDisplayed => !isDisplayed), 5000, 'wait for config form to disappear');
  }

  async waitForLoginBtn() {
    return browser.waitUntil(async () => this.loginRedirectBtn.then(el => el.isDisplayed()), 5000, 'wait for login button');
  }

  async waitForLogoutBtn() {
    return browser.waitUntil(async () => this.logoutRedirectBtn.then(el => el.isDisplayed()), 15000, 'wait for logout button');
  }

  async waitForUserInfo(ignoreNull) {
    return browser.waitUntil(async () => {
      return this.userInfo.then(el => {
        return el.getText();
      }).then(txt => {
        return txt && (ignoreNull ? txt !== 'null' : true);
      });
    }, 5000, 'wait for user info');
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
    await this.waitForUserInfo(true);
    await this.userInfo.then(el => el.getText()).then(txt => {
      assert(txt.indexOf('email') > 0);
    });
  }

  async assertNoUserInfo() {
    await this.waitForUserInfo(false);
    await this.userInfo.then(el => el.getText()).then(txt => {
      assert(txt === 'null');
    });
  }

  async assertIdToken() {
    await this.idToken.then(el => el.getText()).then(txt => {
      assert(txt.indexOf('claims') > 0);
    });
  }

}

export default new SpaApp();
