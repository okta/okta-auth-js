import DirectAuthWebApp from '../pageobjects/DirectAuthWebApp';
import { startApp, getSampleConfig, loginDirect, getRandomPassword, getRandomEmail } from '../util';

const sampleConfig = getSampleConfig();

describe('direct-app: ' + sampleConfig.name, () => {

  // it('can login directly, calling signin() with username and password', async () => {
  //   await startApp(DirectAuthWebApp);
  //   browser.url('/login');
  //   await loginDirect(DirectAuthWebApp);
  //   await DirectAuthWebApp.assertProfile();
  //   await DirectAuthWebApp.logout();
  // });

  // it('will show error if wrong password is provided', async () => {
  //   await startApp(DirectAuthWebApp);
  //   browser.url('/login');
  //   await loginDirect(DirectAuthWebApp, { password: 'wrong' });
  //   await DirectAuthWebApp.assertLoginFailure('Authentication failed');
  // });

  it('can register', async () => {
    const email = getRandomEmail();
    const password = getRandomPassword();

    await startApp(DirectAuthWebApp);

    await DirectAuthWebApp.startRegistration({
      firstName: 'John',
      lastName: 'Smith',
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

});