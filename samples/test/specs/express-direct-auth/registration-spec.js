import DirectAuthWebApp from '../../pageobjects/DirectAuthWebApp';
import { startApp, getRandomPassword, getRandomEmail } from '../../util';

describe('Server-side registration', () => {

  beforeEach(async () => {
    await startApp(DirectAuthWebApp);
  });

  const firstName = 'John';
  const lastName = 'Smith';
  const email = getRandomEmail();
  const password = getRandomPassword();

  it('can register with email and password authenticators', async () => {
    await DirectAuthWebApp.startRegistration({
      firstName,
      lastName,
      email
    });
    await DirectAuthWebApp.enterNewPassword({
      password
    });
    await DirectAuthWebApp.confirmEmail({
      email
    });
    await DirectAuthWebApp.assertProfile({
      email
    });
    await DirectAuthWebApp.logout();
  });

  it('will throw error for already registered user', async () => {
    await DirectAuthWebApp.startRegistration({
      firstName,
      lastName,
      email
    });
    await DirectAuthWebApp.assertError('A user with this Email already exists');
  });


});