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


import TestApp from '../pageobjects/TestApp';
import OktaLogin from '../pageobjects/OktaLogin';
import { openPKCE } from '../util/appUtils';
import { handleCallback } from '../util/loginUtils';

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

describe('email verify', () => {

  it('can handle callback in another tab', async () => {
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
  });
});