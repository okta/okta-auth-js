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
import TestApp from '../pageobjects/TestApp';
import OktaLogin from '../pageobjects/OktaLogin';
import { openPKCE } from '../util/appUtils';
import { handleCallback } from '../util/loginUtils';
import { switchToMainWindow } from '../util/browserUtils';

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

describe('transaction storage', () => {

  it('can handle PKCE callback in another tab', async () => {
    await openPKCE({});
    await TestApp.loginRedirect();
    await OktaLogin.signin(USERNAME, PASSWORD);
    await TestApp.waitForCallback();

    const url = await browser.getUrl();
    browser.newWindow(url, { windowFeatures: 'noopener=yes' });

    // Now handle the callback
    await handleCallback('pkce');

    // Test app should be signed in on the new tab
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();
    await TestApp.logoutRedirect();
    await switchToMainWindow();
  });

  it('if sharedStorage is disabled, will see PKCE error when handling callback in another tab', async () => {
    await openPKCE({ enableSharedStorage: false });
    await TestApp.loginRedirect();
    await OktaLogin.signin(USERNAME, PASSWORD);
    await TestApp.waitForCallback();

    const url = await browser.getUrl();
    browser.newWindow(url, { windowFeatures: 'noopener=yes' });

    // Handle callback in the new tab
    await TestApp.handleCallback();
    await TestApp.error.then(el => el.getText()).then(value => {
      console.log('VALUE', value);
      assert(value.indexOf('Could not load PKCE codeVerifier from storage') >= 0);
    });
    await TestApp.returnHome();
    await TestApp.assertLoggedOut();
    await switchToMainWindow();
  });
});