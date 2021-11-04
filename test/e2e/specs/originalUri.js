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

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

describe('original uri', () => {
  it('can restore orginal uri from callback in a single tab', async () => {
    await openPKCE({});
    await TestApp.navigateToProtectedPage();
    await TestApp.loginRedirect();
    await OktaLogin.signin(USERNAME, PASSWORD);
    await TestApp.waitForCallback();
    await TestApp.handleCallback();
    await TestApp.assertCallbackSuccess();
    await TestApp.callbackOriginalUri.then(el => el.getAttribute('href')).then(value => {
      assert(value.indexOf('/protected') >= 0);
    });
    await TestApp.returnHome();
    await TestApp.logoutRedirect();
  });

  it('can restore orginal uri from callback in another tab', async () => {
    await openPKCE({});
    await TestApp.navigateToProtectedPage();
    await TestApp.loginRedirect();
    await OktaLogin.signin(USERNAME, PASSWORD);
    await TestApp.waitForCallback();

    const url = await browser.getUrl();
    browser.newWindow(url, { windowFeatures: 'noopener=yes' });

    // Handle callback in the new tab
    await TestApp.handleCallback();
    await TestApp.assertCallbackSuccess();
    await TestApp.callbackOriginalUri.then(el => el.getAttribute('href')).then(value => {
      assert(value.indexOf('/protected') >= 0);
    });
    await TestApp.returnHome();
    await TestApp.logoutRedirect();
  });

});