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
import { openPKCE } from '../util/appUtils';
import { loginDirect } from '../util/loginUtils';

const openMultipleTabs = async () => {
  await openPKCE();
  await TestApp.subscribeToAuthState(); // re-render on auth state change
  await TestApp.startService();

  // open in new tab
  await browser.newWindow('/');
  await openPKCE();
  await TestApp.subscribeToAuthState(); // re-render on auth state change
  await TestApp.startService();
};

const assertSameTokensInTabs = async (tabTokenMap, handles) => {
  let preToken;
  for (let i = 0; i < handles.length; i++) {
    const handle = handles[i];
    await browser.switchToWindow(handle);
    tabTokenMap[handle] = {
      idToken: await TestApp.idToken.then(el => el.getText()),
      accessToken: await TestApp.accessToken.then(el => el.getText()),
      refreshToken: await TestApp.refreshToken.then(el => el.getText())
    };
    if (preToken) {
      assert(JSON.stringify(preToken) === JSON.stringify(tabTokenMap[handle]));
    }
    preToken = tabTokenMap[handle];
  }
};

describe('cross tabs AuthState update', () => {
  let handles;
  beforeEach(async () => {
    await openMultipleTabs();
    // login in the latest opened tab
    await loginDirect();
    handles = await browser.getWindowHandles();
  });

  afterEach(async () => {
    await browser.reloadSession();
  });

  it('should update login/logout status cross tabs', async () => {
    // assert login status
    for (let i = 0; i < handles.length; i++) {
      await browser.switchToWindow(handles[i]);
      await TestApp.getUserInfo();
      await TestApp.assertUserInfo();
    }

    // logout in current tab (the last tab)
    await TestApp.logoutRedirect();

    // assert logout status
    for (let i = 0; i < handles.length; i++) {
      await browser.switchToWindow(handles[i]);
      // check if login button is presented
      await TestApp.assertLoggedOut();
    }
  });

  it('should update login/logout status for protected page cross tabs', async () => {
    // assert login status
    for (let i = 0; i < handles.length; i++) {
      await browser.switchToWindow(handles[i]);
      await TestApp.getUserInfo();
      await TestApp.assertUserInfo();
      await TestApp.navigateToProtectedPage();
      // protected page reloads the browser, re-subscribe
      await TestApp.subscribeToAuthState();
      await TestApp.startService();
    }

    // swith back to the first tab
    await browser.switchToWindow(handles[0]);
    // logout in current tab (the last tab)
    await TestApp.logoutRedirect({ clearTokensAfterRedirect: true });

    // assert logout status
    for (let i = 0; i < handles.length; i++) {
      await browser.switchToWindow(handles[i]);
      if (i === 0) {
        // the first tab show sign buttons
        await TestApp.assertLoggedOut();
      } else {
        // other tabs ask to sign-in again
        await TestApp.assertAuthStatusText('Sign-in again');
      }
    }
  });

  it('should update tokens cross tabs', async () => {
    if (process.env.LOCAL_MONOLITH) {
      return pending();
    }

    const preTabTokenMap = {};
    const currentTabTokenMap = {};
    await assertSameTokensInTabs(preTabTokenMap, handles);
    // get new tokens 
    await TestApp.getToken();
    // wait for tokens in current tab
    const handle = await browser.getWindowHandle();
    await browser.waitUntil(async () => {
      const idToken = await TestApp.idToken.then(el => el.getText());
      const accessToken = await TestApp.accessToken.then(el => el.getText());
      let refreshToken;
      if (process.env.REFRESH_TOKEN) {
        refreshToken = await TestApp.refreshToken.then(el => el.getText());
      } 
      return (
        idToken !== preTabTokenMap[handle].idToken &&
        accessToken !== preTabTokenMap[handle].accessToken &&
        refreshToken !== preTabTokenMap[handle].refreshToken
      );
    }, 10000);
    await assertSameTokensInTabs(currentTabTokenMap, handles);

    await TestApp.logoutRedirect();
  });
});
