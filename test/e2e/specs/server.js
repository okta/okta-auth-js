import TestServer from '../pageobjects/TestServer';

const ISSUER = process.env.ISSUER;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

describe('Server-side login', () => {

  beforeEach(async () => {
    await TestServer.open();
  });

  it('can receive sessionToken with valid username/password', async () => {
    await TestServer.issuer.then(el => el.setValue(ISSUER));
    await TestServer.username.then(el => el.setValue(USERNAME));
    await TestServer.password.then(el => el.setValue(PASSWORD));

    await TestServer.submitLogin();
    await TestServer.assertLoginSuccess();
  });

  it('will throw error for wrong password', async() => {
    await TestServer.issuer.then(el => el.setValue(ISSUER));
    await TestServer.username.then(el => el.setValue(USERNAME));
    await TestServer.password.then(el => el.setValue('wrong password!!!'));

    await TestServer.submitLogin();
    await TestServer.assertLoginFailure();
  });

});