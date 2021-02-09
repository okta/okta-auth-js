import TestApp from '../pageobjects/TestApp';
import OktaLogin from '../pageobjects/OktaLogin';
import { openPKCE } from '../util/appUtils';

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

describe('interaction flow', () => {

  it('detects `interaction_required` on the redirect callback', async () => {
    await openPKCE({});
    await TestApp.loginRedirect();
    await OktaLogin.signin(USERNAME, PASSWORD); // on Okta
    await TestApp.waitForCallback();

    // Manually change the URL. All other data should be present in browser storage
    await browser.url('/implicit/callback?error=interaction_required');

    // Now handle the callback
    await TestApp.handleCallback();

    // Test app should display the signin widget
    await TestApp.waitForLoginBtn();
    await OktaLogin.signin(USERNAME, PASSWORD); // on widget
    await TestApp.assertLoggedIn();
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();
    await TestApp.logoutRedirect();
  });
});