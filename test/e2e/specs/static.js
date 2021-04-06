import StaticApp from '../pageobjects/StaticApp';
import OktaLogin from '../pageobjects/OktaLogin';
import OIEOktaLogin from '../pageobjects/OIEOktaLogin';
import TestApp from '../pageobjects/TestApp';

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

describe('Static App', () => {

  beforeEach(async () => {
    await StaticApp.open();
  });

  it('can login, display userinfo, and logout', async () => {
    await StaticApp.clickLogin();

    if (process.env.ORG_OIE_ENABLED) {
      await OIEOktaLogin.signin(USERNAME, PASSWORD);
    } else {
      await OktaLogin.signin(USERNAME, PASSWORD);
    }
    await StaticApp.assertUserInfo();
    await StaticApp.assertNoError();
    await StaticApp.clickLogout();
    await TestApp.waitForLoginBtn();
  });

});