import StaticApp from '../pageobjects/StaticApp';
import OktaLogin from '../pageobjects/OktaLogin';
import TestApp from '../pageobjects/TestApp';

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

describe('Static App', () => {

  beforeEach(async () => {
    await StaticApp.open();
  });

  it('can login, display userinfo, and logout', async () => {
    await StaticApp.clickLogin();
    await OktaLogin.signin(USERNAME, PASSWORD);
    await StaticApp.assertUserInfo();
    await StaticApp.assertNoError();
    await StaticApp.clickLogout();
    await TestApp.waitForLoginBtn();
  });

});