import WebApp from '../pageobjects/WebApp';
import { startApp, getSampleConfig, loginDirect } from '../util';

const sampleConfig = getSampleConfig();

describe('web-app: ' + sampleConfig.name, () => {

  it('can login directly, calling signin() with username and password', async () => {
    await startApp(WebApp);
    await loginDirect(WebApp);
    if (sampleConfig.oidc) {
      await WebApp.assertAccessToken();
    } else {
      await WebApp.assertLoginSuccess();
    }
  });

  it('will show error if wrong password is provided', async () => {
    await startApp(WebApp);
    await loginDirect(WebApp, { password: 'wrong' });
    await WebApp.assertLoginFailure();
  });

});