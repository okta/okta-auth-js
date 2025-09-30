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

/* eslint-disable max-len */

import assert from 'assert';
import toQueryString from '../util/toQueryString';
import {
  Nav,
  Unauth,
  UserHome,
} from  '../support/selectors';
import waitForDisplayed from '../support/wait/waitForDisplayed';
import clickElement from '../support/action/clickElement';
import checkEqualsText from '../support/check/checkEqualsText';


// Selectors
const loginForm = '#static-signin-form';
const username = `${loginForm} input[name=username]`;
const password = `${loginForm} input[name=password]`;
const submit = `${loginForm} [data-se=submit]`;
const userEmail = `#userinfo #claim-email`;

const selectors = {
  username,
  password,
  submit
};
class SpaApp {
  selectors = selectors;
  // Authenticated landing
  get logoutRedirectBtn() { return $('#logout-redirect'); }
  get getUserInfoBtn() { return $(UserHome.profileButton); }
  get userInfo() { return $('#userInfo'); }

  // Unauthenticated landing
  get loginRedirectBtn() { return $(Unauth.loginRedirect); }
  get username() { return $(selectors.username); }
  get password() { return $(selectors.password); }
  get signinFormSubmit() { return $(selectors.submit); }

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
    await waitForDisplayed(userEmail, false);
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
    await waitForDisplayed(userEmail, false);
    await checkEqualsText('element', userEmail, false, process.env.USERNAME);
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
