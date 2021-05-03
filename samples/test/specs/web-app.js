import WebApp from '../pageobjects/WebApp';
import { startApp, getSampleConfig, loginDirect } from '../util';

const sampleConfig = getSampleConfig();

describe('web-app: ' + sampleConfig.name, () => {

  // TODO: fix this test. Fails in incognito, succeeds in regular window. May be related to 3rd party cookies.
  xit('can login directly, calling signin() with username and password', async () => {
    await startApp(WebApp);
    await loginDirect(WebApp);
    if (sampleConfig.oidc) {
      await browser.pause(5000);
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