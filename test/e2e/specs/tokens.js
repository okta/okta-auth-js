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


import { crypto } from '@okta/okta-auth-js';
import assert from 'assert';
import TestApp from '../pageobjects/TestApp';
import OktaHome from '../pageobjects/OktaHome';
import { flows, openImplicit, openPKCE } from '../util/appUtils';
import { loginPopup, loginDirect } from '../util/loginUtils';
import { openOktaHome, switchToMainWindow } from '../util/browserUtils';


// Refresh tokens are tested in a separate file
const scopes = ['openid', 'email']; // do not include "offline_access"

describe('token revoke', () => {
  it('can revoke the access token', async () => {
    await openPKCE({ scopes });
    await loginPopup();
    
    // We should be able to request and display user info with no errors
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();

    // Revoke the token
    await TestApp.revokeToken();
    await browser.waitUntil(async () => {
      const txt = await TestApp.tokenMsg.then(el => el.getText());
      return txt !== '';
    }, 10000, 'wait for token message');
    const txt = await TestApp.tokenMsg.then(el => el.getText());
    assert(txt === 'access token revoked');

    // Now if we try to get user info, we should receive an error
    await TestApp.getUserInfo();
    await TestApp.error.then(el => el.waitForExist(15000, false, 'wait for error'));
    const error = await TestApp.error.then(el => el.getText());
    assert(error === 'Error: Missing tokens');

    await TestApp.logoutRedirect();
  });
});

describe('E2E token flows', () => {

  flows.forEach(flow => {
    describe(flow + ' flow', () => {

      async function login(options) {
        options = Object.assign({
          scopes
        }, options);
        (flow === 'pkce') ? await openPKCE(options) : await openImplicit(options);
        await loginPopup(flow);
      }

      it('can renew the access token', async () => {
        await login();
        const prevToken = await TestApp.accessToken.then(el => el.getText());
        await TestApp.renewToken();
        await browser.waitUntil(async () => {
          const txt = await TestApp.accessToken.then(el => el.getText());
          return txt !== prevToken;
        }, 10000);
        await TestApp.assertLoggedIn();
        await TestApp.logoutRedirect();
      });

      it('can refresh all tokens', async () => {
        await login();
        const prev = {
          idToken: await TestApp.idToken.then(el => el.getText()),
          accessToken: await TestApp.accessToken.then(el => el.getText())
        };
        await TestApp.getToken();
        await browser.waitUntil(async () => {
          const idToken = await TestApp.idToken.then(el => el.getText());
          const accessToken = await TestApp.accessToken.then(el => el.getText());
          return (
            idToken !== prev.idToken &&
            accessToken !== prev.accessToken
          );
        }, 10000);
        await TestApp.assertLoggedIn();
        await TestApp.logoutRedirect();
      });

      it('Can receive an error on token renew if user has signed out from Okta page', async () => {
        await login();
        await TestApp.subscribeToTokenEvents();
        let tokenError = await TestApp.tokenError.then(el => el.getText());
        assert(tokenError.trim() === '');
        await openOktaHome();
        await OktaHome.signOut();
        await browser.closeWindow();
        await switchToMainWindow();
        await TestApp.renewToken();
        await browser.waitUntil(async () => {
          const txt = await TestApp.tokenError.then(el => el.getText());
          return txt !== tokenError;
        }, 10000, 'wait for token error');
        await TestApp.tokenError.then(el => el.getText()).then(msg => {
          assert(msg.trim() === 'OAuthError: The client specified not to prompt, but the user is not logged in.');
        });
        await TestApp.clearTokens();
        await browser.refresh();
        await TestApp.waitForLoginBtn(); // assert we are logged out
      });
    });
  });
});

describe('Token auto renew', () => {
  const defaultOptions = {
    expireEarlySeconds: 60 * 59 + 55,
    scopes
  };

  afterEach(async () => {
    await TestApp.logoutRedirect();
    // auto renew tests are highly stateful, reload session after each case
    await browser.reloadSession();
  });

  describe('implicit flow', () => {
    it('allows renewing an accessToken, without renewing idToken', async () => {
      await openImplicit({ ...defaultOptions, responseType: 'token' });
      await loginDirect();
      await TestApp.startService();
      await TestApp.subscribeToAuthState();
      await TestApp.waitForAccessTokenRenew();
      const idToken = await TestApp.getIdToken();
      assert(idToken === null);
    });

    it('allows renewing an idToken, without renewing accessToken', async () => {
      await openImplicit({ ...defaultOptions, responseType: 'id_token' });
      await loginDirect();
      await TestApp.startService();
      await TestApp.subscribeToAuthState();
      await TestApp.waitForIdTokenRenew();
      const accessToken = await TestApp.getAccessToken();
      assert(accessToken === null);
    });
  });

  flows.forEach(flow => {
    const openFn = flow === 'pkce' ? openPKCE : openImplicit;

    it(`${flow}: renews idToken and accessToken`, async () => {
      await openFn({ ...defaultOptions });
      await loginDirect();
      await TestApp.startService();
      await TestApp.subscribeToAuthState();
      // renews both token together
      await TestApp.waitForIdTokenRenew();
      const idToken = await TestApp.getIdToken();
      const accessToken = await TestApp.getAccessToken();
      // verify idToken integrity
      const hash = await crypto.getOidcHash(accessToken.accessToken);
      assert(hash === idToken.claims.at_hash);
    });

    it(`${flow} can continuously renew tokens`, async () => {
      await openFn({ ...defaultOptions });
      await TestApp.startService();
      await TestApp.subscribeToAuthState();
      await loginDirect();
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      for (const _ of [0, 0]) { // auto renew should be able to happen more than once
        // renews both token together
        await TestApp.waitForIdTokenRenew();
        const idToken = await TestApp.getIdToken();
        const accessToken = await TestApp.getAccessToken();
        // verify idToken integrity
        const hash = await crypto.getOidcHash(accessToken.accessToken);
        assert(hash === idToken.claims.at_hash);
      }
    });
  });
});