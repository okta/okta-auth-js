import assert from 'assert';
import toQueryString from '../util/toQueryString';
import {
  LoginForm,
  Nav,
  Unauth,
  UserHome,
  UserProfile
} from  '../support/selectors';
import waitForDisplayed from '../support/wait/waitForDisplayed';
import clickElement from '../support/action/clickElement';
import checkEqualsText from '../support/check/checkEqualsText';

/* eslint-disable max-len */
class SpaApp {

  // Authenticated landing
  get logoutRedirectBtn() { return $('#logout-redirect'); }
  get getUserInfoBtn() { return $(UserHome.profileButton); }
  get userInfo() { return $('#userInfo'); }

  // Unauthenticated landing
  get loginRedirectBtn() { return $(Unauth.loginRedirect); }
  get username() { return $(LoginForm.username); }
  get password() { return $(LoginForm.password); }
  get signinFormSubmit() { return $(LoginForm.submit); }

  // Form
  get configForm() { return $('#config-form'); }
  get clientId() { return $('#clientId'); }
  get issuer() { return $('#issuer'); }

  // Callback}
  get returnHomeBtn() { return $('#return-home'); }
  get accessToken() { return $('#accessToken'); }
  get idToken() { return $('#idToken'); }
  get error() { return $('#error'); }

  async open(queryObj: Record<string, string>) {
    await browser.url(toQueryString(queryObj));
  }

  async loginRedirect() {
    await this.waitForLoginBtn();
    const el = await this.loginRedirectBtn;
    el.click();
  }

  async getUserInfo() {
    await waitForDisplayed(UserHome.profileButton, false);
    await clickElement('click', 'selector', UserHome.profileButton);
  }

  async returnHome() {
    await waitForDisplayed(Nav.returnHome, false);
    await clickElement('click', 'selector', Nav.returnHome);
  }

  async loginDirect() {
    await this.signinFormSubmit.then(el => el.click());
  }

  async logoutRedirect() {
    await this.logoutRedirectBtn.then(el => el.click());
    await this.waitForError('Click "Edit Config" and set the `issuer` and `clientId`');
  }

  async waitForError(str) {
    return browser.waitUntil(async () => {
      return this.error.then(el => {
        return el.getText();
      }).then(txt => {
        return txt === str;
      });
    }, 5000, `wait for error: "${str}"`);
  }

  async waitForConfigForm() {
    return browser.waitUntil(async () => this.configForm.then(el => el.isDisplayed()), 5000, 'wait for config form');
  }

  async waitForNoConfigForm() {
    return browser.waitUntil(async () => this.configForm.then(el => el.isDisplayed()).then(isDisplayed => !isDisplayed), 5000, 'wait for config form to disappear');
  }

  async waitForLoginBtn() {
    return browser.waitUntil(async () => this.loginRedirectBtn, 5000, 'wait for login button');
  }

  async waitForLogoutBtn() {
    return browser.waitUntil(async () => this.logoutRedirectBtn.then(el => el.isDisplayed()), 15000, 'wait for logout button');
  }

  async waitForUserInfo() {
    await waitForDisplayed(UserProfile.email, false);
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
    await waitForDisplayed(UserProfile.email, false);
    await checkEqualsText('element', UserProfile.email, false, process.env.USERNAME as string);
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
