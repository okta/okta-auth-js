import TestApp from '../pageobjects/TestApp';
import OktaHome from '../pageobjects/OktaHome'
import { openPKCE } from '../util/appUtils';
import { loginPopup } from '../util/loginUtils';
import { openOktaHome, switchToMainWindow } from '../util/browserUtils';
import OktaLogin from '../pageobjects/OktaLogin';

describe('E2E logout', () => {
    beforeEach(async () => {
      await openPKCE();
      await loginPopup();
    });

    it('can logout locally, keeping remote user session open', async () => {
      await TestApp.logoutLocal();

      // We should still be logged into Okta
      await openOktaHome();
      await OktaHome.waitForLoad();

      // Now sign the user out
      await OktaHome.signOut();
      await browser.closeWindow();
      await switchToMainWindow();

    });

    it('can logout from okta, ending remote user session', async() => {
      await TestApp.logout();

      // We should not be logged into Okta
      await openOktaHome();
      await OktaLogin.waitForLoad();

      // cleanup
      await browser.closeWindow();
      await switchToMainWindow();
    });

    it('can logout from okta and redirect back to the application', async () => {
      await TestApp.assertIdToken();
      await TestApp.logoutRedirect();
    });

    it('no idToken: can logout from okta and redirect back to the application', async () => {
      await TestApp.clearTokens();
      await TestApp.logoutRedirect();
    });

});