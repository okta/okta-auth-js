import assert from 'assert';
import TestApp from '../pageobjects/TestApp';
import OktaHome from '../pageobjects/OktaHome';
import { openPKCE } from '../util/appUtils';
import { loginPopup } from '../util/loginUtils';
import { openOktaHome, switchToMainWindow } from '../util/browserUtils';

describe('token revoke', () => {
  it('can revoke the refresh token', async () => {
    await openPKCE();
    await loginPopup();
    
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
  const flow = 'pkce';
  beforeEach(async () => {
    await openPKCE(); // Refresh tokens are supported in PKCE flow only
  });

  it('can renew the access token', async () => {
    await loginPopup(flow);
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
    await loginPopup(flow);
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

  it('can do token renew if user has signed out from Okta page', async () => {
    await loginPopup(flow);
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