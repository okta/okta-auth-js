import assert from 'assert';
import TestApp from '../pageobjects/TestApp';
import { openPKCE } from '../util/appUtils';
import { loginPopup } from '../util/loginUtils';

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
    await loginPopup();
    handles = await browser.getWindowHandles();
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

  it('should update tokens cross tabs', async () => {
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
