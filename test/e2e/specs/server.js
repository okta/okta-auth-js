import TestServer from '../pageobjects/TestServer';
import { getRandomPassword, getRandomEmail } from '../util/randomUtils';

const ISSUER = process.env.ISSUER;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

const firstName = 'John';
const lastName = 'Smith';
const email = getRandomEmail();
const password = getRandomPassword();

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

if (process.env.ORG_OIE_ENABLED) {
  describe('Server-side registration', () => {

    beforeEach(async () => {
      await TestServer.open();
    });

    it('can register with password authenticator and receive tokens', async () => {
      await TestServer.issuer.then(el => el.setValue(ISSUER));
      await TestServer.rFirstName.then(el => el.setValue(firstName));
      await TestServer.rLastName.then(el => el.setValue(lastName));
      await TestServer.rEmail.then(el => el.setValue(email));
      await TestServer.rPassword.then(el => el.setValue(password));

      await TestServer.submitRegister();
      await TestServer.assertRegisterSuccess(email);
    });

    it('will throw error for already registered user', async () => {
      await TestServer.issuer.then(el => el.setValue(ISSUER));
      await TestServer.rFirstName.then(el => el.setValue(firstName));
      await TestServer.rLastName.then(el => el.setValue(lastName));
      await TestServer.rEmail.then(el => el.setValue(email));
      await TestServer.rPassword.then(el => el.setValue(password));

      await TestServer.submitRegister();
      await TestServer.assertRegisterFailure('A user with this Email already exists');
    });

    it('will throw error for bad registration data', async () => {
      await TestServer.issuer.then(el => el.setValue(ISSUER));

      await TestServer.submitRegister();
      await TestServer.assertRegisterFailure('\'Email\' must be in the form of an email address');
    });

  });
}