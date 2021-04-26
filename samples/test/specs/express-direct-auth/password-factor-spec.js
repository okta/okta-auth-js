
import { loginDirect, startApp } from '../../util';
import { getConfig } from '../../util/configUtils';
import DirectAuthWebApp from '../../pageobjects/DirectAuthWebApp';

describe('password factor authentication', () => {
  it('succeedes with valid credentials provided', async () => {
    await startApp(DirectAuthWebApp);
    await DirectAuthWebApp.startFlow('password-factor');
    await loginDirect(DirectAuthWebApp);
    await DirectAuthWebApp.viewProfilePage();

    expect(await (await (DirectAuthWebApp.emailClaim)).getText()).toEqual(getConfig().username);
    await DirectAuthWebApp.logout();
  });

  it('displays an error message for bad credentials', async () => {
    await startApp(DirectAuthWebApp);
    await DirectAuthWebApp.startFlow('password-factor');
    await loginDirect(DirectAuthWebApp, {
      username: 'btables',
      password: '`1=true'
    });

    expect(await(await DirectAuthWebApp.errorBanner).getText())
      .toContain('You are not allowed to access this app. To request access, contact an admin.');
  });

});