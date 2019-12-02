import assert from 'assert';
import TestApp from '../pageobjects/TestApp';
import OktaHome from '../pageobjects/OktaHome';
import { flows, openImplicit, openPKCE } from '../util/appUtils';
import { loginPopup } from '../util/loginUtils';
import { openOktaHome, switchToMainWindow } from '../util/browserUtils';

describe('token revoke', () => {
  it('can revoke the access token', async () => {
    await openPKCE();
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
    assert(error === 'AuthApiError');
    const xhrError = await TestApp.xhrError.then(el => el.getText());
    assert(xhrError === 'Network request failed');

    await TestApp.logout();
  });
});

describe('E2E token flows', () => {

  flows.forEach(flow => {
    describe(flow + ' flow', () => {
      beforeEach(async () => {
        (flow === 'pkce') ? await openPKCE() : await openImplicit();
      });

      it('can renew the id token', async () => {
        await loginPopup(flow);
        const prevToken = await TestApp.idToken.then(el => el.getText());
        await TestApp.renewToken();
        await browser.waitUntil(async () => {
          const txt = await TestApp.idToken.then(el => el.getText());
          return txt !== prevToken;
        }, 10000);
        await TestApp.assertLoggedIn();
        await TestApp.logout();
      });

      it('can refresh all tokens', async () => {
        await loginPopup(flow);
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
        await TestApp.logout();
      });

      it('Can receive an error on token renew if user has signed out from Okta page', async () => {
        await loginPopup(flow);
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
        await browser.refresh();
        await TestApp.waitForLoginBtn(); // assert we are logged out
      });
    });
  });
});