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

class StaticApp {
  get unauth() { return $('#unauth'); }
  get auth() { return $('#auth'); }
  get userinfo() { return $('#userinfo'); }
  get error() { return $('#error'); }
  get login() { return $('#login'); }
  get logout() { return $('#logout'); }

  async open() {
    const ISSUER = process.env.ISSUER;
    const CLIENT_ID = process.env.CLIENT_ID;
    const params = toQueryString({
      issuer: ISSUER,
      clientId: CLIENT_ID
    });
    await browser.url('/static' + params);
    await browser.waitUntil(async () => this.error.then(el => el.isExisting()), 5000, 'wait for error selector');
  }

  async assertNoError() {
    await this.error.then(el => el.getText()).then(txt => {
      assert(txt === '');
    });
  }

  async waitForLoginBtn() {
    return browser.waitUntil(async () => this.login.then(el => el.isDisplayed()), 5000, 'wait for login button');
  }

  async clickLogin() {
    await this.waitForLoginBtn();
    await this.login.then(el => el.click());
  }

  async waitForUserInfo() {
    return browser.waitUntil(async () => this.userinfo.then(el => el.isDisplayed()), 5000, 'wait for userinfo');
  }

  async assertUserInfo() {
    await this.waitForUserInfo();
    await this.userinfo.then(el => el.getText()).then(txt => {
      assert(txt !== '');
    });
  }

  async waitForLogoutBtn() {
    return browser.waitUntil(async () => this.logout.then(el => el.isDisplayed()), 5000, 'wait for logout button');
  }

  async clickLogout() {
    await this.waitForLogoutBtn();
    await this.logout.then(el => el.click());
  }

}

export default new StaticApp();