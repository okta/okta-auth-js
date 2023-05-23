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
import { openPKCE } from '../util/appUtils';
import { loginDirect } from '../util/loginUtils';
import { openOktaHome, switchToMainWindow } from '../util/browserUtils';
import OktaLogin from '../pageobjects/OktaLogin';

describe('E2E logout', () => {
    beforeEach(async () => {
      await openPKCE();
      await loginDirect();
    });

    describe('logoutApp', () => {
      it('can clear app session, keeping remote SSO session open', async () => {
        if (process.env.LOCAL_MONOLITH) {
          return pending();
        }

        await TestApp.logoutApp();
  
        // We should still be logged into Okta
        await openOktaHome();
        await OktaHome.waitForLoad();
  
        // Now sign the user out
        await OktaHome.closeInitialPopUp();
        await OktaHome.signOut();
        await browser.closeWindow();
        await switchToMainWindow();
      });
  
    });

    describe('logoutRedirect', () => {
      it('can logout from okta, ending remote user session', async() => {
        await TestApp.assertIdToken();
        await TestApp.logoutRedirect();
  
        // We should not be logged into Okta
        await openOktaHome();
        await OktaLogin.waitForLoad();
  
        // cleanup
        await browser.closeWindow();
        await switchToMainWindow();
      });
  
      it('no idToken: can logout from okta (using XHR fallback) and end back to the application', async () => {
        await TestApp.clearTokens();
        await TestApp.logoutRedirect();

        // We should not be logged into Okta
        await openOktaHome();
        await OktaLogin.waitForLoad();
  
        // cleanup
        await browser.closeWindow();
        await switchToMainWindow();
      });
    });

    describe('logoutXHR', () => {
      it('can logout from okta using XHR, ending remote user session', async() => {
        if (process.env.LOCAL_MONOLITH) {
          return pending();
        }

        await TestApp.logoutXHR();
  
        // We should not be logged into Okta
        await openOktaHome();
        await OktaLogin.waitForLoad();
  
        // cleanup
        await browser.closeWindow();
        await switchToMainWindow();
      });
    });

});
