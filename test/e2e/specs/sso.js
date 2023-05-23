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
import OktaHome from '../pageobjects/OktaHome';
import OktaLogin from '../pageobjects/OktaLogin';
import { openPKCE } from '../util/appUtils';
import { loginDirect } from '../util/loginUtils';
import {
  openOktaHome,
  switchToMainWindow,
  switchToSecondWindow,
  reloadWindow
} from '../util/browserUtils';

describe('SSO', () => {
  let testContext;
  beforeEach(() => {
    testContext = {
      options: {
        scopes: ['openid', 'email'], // do not include "offline_access", refresh tokens change SSO behavior
        storage: 'sessionStorage', // do not share tokens between tabs
        useInteractionCodeFlow: process.env.ORG_OIE_ENABLED
      }
    };
  });

  it('starts an SSO session', async () => {
    if (process.env.LOCAL_MONOLITH) {
      return pending();
    }

    // open 2 tabs: app & okta
    await openPKCE(testContext.options);
    await openOktaHome();

    // Confirm initial state, not signed in
    await OktaLogin.waitForLoad();

    // Login using the app
    await switchToMainWindow();
    await loginDirect();
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();

    // We should see ourselves signed in on Okta home
    await switchToSecondWindow();
    await reloadWindow();
    await OktaHome.signOut();
    await browser.closeWindow();

    // Sign out using the app
    await switchToMainWindow();
    await TestApp.logoutRedirect();
  });

  it('signing out will end the SSO session', async () => {
    await openPKCE(testContext.options);
    await loginDirect();

    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();
    await TestApp.logoutRedirect();

    // We should not be signed in on Okta page
    await openOktaHome();
    await OktaLogin.waitForLoad();
    await switchToMainWindow();
  });

  it('another instance of the app can signin without entering credentials', async () => {
    if (process.env.LOCAL_MONOLITH) {
      return pending();
    }
    
    await openPKCE(testContext.options);
    await loginDirect();
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();

    // Open a 2nd tab
    await openPKCE(testContext.options, true);
    // should not be seen as logged in (tokens are in sessionStorage)
    await TestApp.waitForLoginBtn();

    // Do login flow without entering credentials
    await TestApp.loginDirect(false);

    // Assert user is signed in
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();

    await TestApp.logoutRedirect();
  });
});