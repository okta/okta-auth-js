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

/* eslint-disable max-len */
class TestServer {
  get rootSelector() { return $('#root'); }

  get configLink() { return $('a.config-link'); }

  // form
  get issuer() { return $('#f_issuer'); }
  get username() { return $('#username'); }
  get password() { return $('#password'); }
  get submitBtn() { return $('#submitBtn'); }

  // results
  get status() { return $('#status'); }
  get sessionToken() { return $('#sessionToken'); }
  get error() { return $('#error'); }

  async open() {
    await browser.url('/server');
    await browser.waitUntil(async () => this.rootSelector.then(el => el.isExisting()), 5000, 'wait for root selector');
    await this.openConfigForm();
  }

  async openConfigForm() {
    await this.configLink.then(el => el.click());
  }

  async submitLogin() {
    await this.submitBtn.then(el => el.click());
  }

  async assertLoginSuccess() {
    await browser.waitUntil(async () => {
      const txt = await this.status.then(el => el.getText());
      return !!txt;
    });
    await this.status.then(el => el.getText()).then(txt => {
      assert(txt.trim() === 'SUCCESS');
    });
    await this.error.then(el => el.getText()).then(txt => {
      assert(txt.trim() === '""');
    });
    await this.sessionToken.then(el => el.getText()).then(txt => {
      assert(txt.trim() !== '');
    });
  }

  async assertLoginFailure() {
    await browser.waitUntil(async () => {
      const txt = await this.error.then(el => el.getText());
      return !!txt;
    });
    await this.status.then(el => el.getText()).then(txt => {
      assert(txt.trim() === '');
    });
    await this.error.then(el => el.getText()).then(txt => {
      const err = JSON.parse(txt);
      assert(err.name === 'AuthApiError');
      assert(err.errorSummary === 'Authentication failed');
    });
    await this.sessionToken.then(el => el.getText()).then(txt => {
      assert(txt.trim() === '');
    });
  }

}

export default new TestServer();
