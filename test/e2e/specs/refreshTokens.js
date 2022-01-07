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
import { openPKCE } from '../util/appUtils';
import { loginDirect } from '../util/loginUtils';
import { openOktaHome, switchToMainWindow } from '../util/browserUtils';

describe('token revoke', () => {
  it('can revoke the refresh token', async () => {
    await openPKCE();
    await loginDirect();
    
    // Revoke the token
    await TestApp.revokeRefreshToken();
    await browser.waitUntil(async () => {
      const txt = await TestApp.tokenMsg.then(el => el.getText());
      return txt !== '';
    }, 10000, 'wait for token message');
    const txt = await TestApp.tokenMsg.then(el => el.getText());
    assert(txt === 'refresh token revoked');

    await TestApp.logoutRedirect();
  });
});

describe('E2E token flows', () => {
  beforeEach(async () => {
    await openPKCE(); // Refresh tokens are supported in PKCE flow only
  });

  it('can renew the access token', async () => {
    await loginDirect();
    const prevToken = await TestApp.accessToken.then(el => el.getText());
    await TestApp.renewToken();
    await browser.waitUntil(async () => {
      const txt = await TestApp.accessToken.then(el => el.getText());
      return txt !== prevToken;
    }, 10000);
    await TestApp.assertLoggedIn();
    await TestApp.logoutRedirect();
  });
  
  it('can refresh all tokens using getWithoutPrompt', async () => {
    await loginDirect();
    const prev = {
      idToken: await TestApp.idToken.then(el => el.getText()),
      accessToken: await TestApp.accessToken.then(el => el.getText()),
      refreshToken: await TestApp.refreshToken.then(el => el.getText())
    };
    await TestApp.getToken();
    await browser.waitUntil(async () => {
      const idToken = await TestApp.idToken.then(el => el.getText());
      const accessToken = await TestApp.accessToken.then(el => el.getText());
      const refreshToken = await TestApp.refreshToken.then(el => el.getText());
      return (
        idToken !== prev.idToken &&
        accessToken !== prev.accessToken && 
        refreshToken !== prev.refreshToken 
      );
    }, 10000);
    await TestApp.assertLoggedIn();
    await TestApp.logoutRedirect();
  });

  it('can renew all tokens', async () => {
    await loginDirect();
    const prev = {
      idToken: await TestApp.idToken.then(el => el.getText()),
      accessToken: await TestApp.accessToken.then(el => el.getText()),
      refreshToken: await TestApp.refreshToken.then(el => el.getText())
    };
    await TestApp.renewTokens();
    await browser.waitUntil(async () => {
      const idToken = await TestApp.idToken.then(el => el.getText());
      const accessToken = await TestApp.accessToken.then(el => el.getText());
      const refreshToken = await TestApp.refreshToken.then(el => el.getText());
      return (
        idToken !== prev.idToken &&
        accessToken !== prev.accessToken && 
        refreshToken !== prev.refreshToken 
      );
    }, 10000);
    await TestApp.assertLoggedIn();
    await TestApp.logoutRedirect();
  });

  it('can do token renew if user has signed out from Okta page', async () => {
    await loginDirect();
    const prevToken = await TestApp.accessToken.then(el => el.getText());
    let tokenError = await TestApp.tokenError.then(el => el.getText());
    assert(tokenError.trim() === '');
    await openOktaHome();
    await OktaHome.signOut();
    await browser.closeWindow();
    await switchToMainWindow();
    await TestApp.renewToken();
    await browser.waitUntil(async () => {
      const tokenErrorTxt = await TestApp.tokenError.then(el => el.getText());
      const tokenTxt = await TestApp.accessToken.then(el => el.getText());
      return (tokenErrorTxt == tokenError && tokenTxt !== prevToken);
    }, 10000, 'wait for token error');
    await TestApp.tokenError.then(el => el.getText()).then(msg => {
      assert(msg.trim() === '');
    });
    await TestApp.clearTokens();
    await browser.refresh();
    await TestApp.waitForLoginBtn(); // assert we are logged out
  });
});

describe('Token auto renew', () => {
  const defaultOptions = {
    expireEarlySeconds: 60 * 59 + 55
  };

  afterEach(async () => {
    await TestApp.logoutRedirect();
    // auto renew tests are highly stateful, reload session after each case
    await browser.reloadSession();
  });

  it('renews idToken and accessToken', async () => {
    await openPKCE({ ...defaultOptions });
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

  
  it('can continuously renew tokens', async () => {
    await openPKCE({ ...defaultOptions });
    await loginDirect();
    await TestApp.startService();
    await TestApp.subscribeToAuthState();
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