import TestApp from '../pageobjects/TestApp';
import OktaHome from '../pageobjects/OktaHome';
import { openPKCE } from '../util/appUtils';
import { loginPopup } from '../util/loginUtils';
import { openOktaHome, switchToMainWindow } from '../util/browserUtils';
import OktaLogin from '../pageobjects/OktaLogin';

describe('E2E logout', () => {
    beforeEach(async () => {
      await openPKCE();
      await loginPopup();
    });

    describe('logoutApp', () => {
      it('can clear app session, keeping remote SSO session open', async () => {
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
