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
import { openPKCE } from '../util/appUtils';
import { loginDirect } from '../util/loginUtils';
import {
  switchToMainWindow,
  switchToSecondWindow,
} from '../util/browserUtils';
import OktaLogin from '../pageobjects/OktaLogin';

describe('protected page', () => {

  it('auth required', async () => {
    // Open protected page for the first time without being authenticated
    // Expected: auto redirect to sign-in page
    await openPKCE({});
    await TestApp.assertLoggedOut();
    await TestApp.navigateToProtectedPage();
    await TestApp.assertAuthStatusText('You are being redirected to sign-in page automatically');
    await OktaLogin.waitForLoad();

    // Authenticate, open protected page, start service
    await openPKCE({});
    await loginDirect();
    await TestApp.assertLoggedIn();
    await TestApp.navigateToProtectedPage();
    await TestApp.startService();

    // Open protected page in new tab, logout
    await openPKCE({}, true);
    await switchToSecondWindow();
    await TestApp.waitForLogoutBtn();
    await TestApp.logoutRedirect();
    await TestApp.assertLoggedOut();
    await browser.closeWindow();

    // Go back to original tab
    // Expected: Show user buttons to sign-in again
    await switchToMainWindow();
    await TestApp.assertAuthStatusText('Sign-in again');

    // Sign-in directly
    // Expected: page is being updated
    await loginDirect();
    await TestApp.assertAuthStatusText('You are authenticated');
    
    // Complete test
    await TestApp.waitForLogoutBtn();
    await TestApp.logoutRedirect();
  });
});
