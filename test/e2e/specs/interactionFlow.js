import TestApp from '../pageobjects/TestApp';
import OktaLogin from '../pageobjects/OktaLogin';
import OIEOktaLogin from '../pageobjects/OIEOktaLogin';
import { openPKCE } from '../util/appUtils';

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

describe('interaction flow', () => {

  it('detects `interaction_required` on the redirect callback', async () => {
    await openPKCE({});
    await TestApp.loginRedirect();
    if (process.env.ORG_OIE_ENABLED) {
      await OIEOktaLogin.signin(USERNAME, PASSWORD);
    } else {
      await OktaLogin.signin(USERNAME, PASSWORD);
    }
    await TestApp.waitForCallback();

    // Manually change the URL. All other data should be present in browser storage
    await browser.url('/login/callback?error=interaction_required');

    // Now handle the callback
    await TestApp.handleCallback();

    // Test app should display the signin widget
    await TestApp.waitForSigninWidget();
  });
});