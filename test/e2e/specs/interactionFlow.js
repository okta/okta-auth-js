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

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const ORG_OIE_ENABLED = process.env.ORG_OIE_ENABLED;

describe('interaction flow', () => {

  it('detects `interaction_required` on the redirect callback', async () => {
    await openPKCE({});
    await TestApp.loginRedirect(); // will create transaction Meta

    // Manually change the URL. All other data should be present in browser storage
    await browser.url('/login/callback?error=interaction_required');

    // Now handle the callback
    await TestApp.handleCallback();

    // Test app should display the signin widget
    await TestApp.waitForSigninWidget();
  });

  it('can successfully signin withh `interaction_required` callback', async () => {
    if (!ORG_OIE_ENABLED) {
      return; // interaction_required only supported on OIE orgs
    }

    if (process.env.LOCAL_MONOLITH) {
      return pending();
    }
    
    await openPKCE({});
    await TestApp.loginRedirect(); // will create transaction Meta
    await OktaLogin.signin(USERNAME, PASSWORD);
    await TestApp.waitForCallback();

    // Manually change the URL. All other data should be present in browser storage
    await browser.url('/login/callback?error=interaction_required');

    // Now handle the callback
    await TestApp.handleCallback();
    await TestApp.assertLoggedIn();
    await TestApp.logoutRedirect();
  });
});