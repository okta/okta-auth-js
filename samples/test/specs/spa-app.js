import SpaApp from '../pageobjects/SpaApp';
import { startApp, getSampleConfig, loginRedirect, loginDirect, loginWidget } from '../util';

const sampleConfig = getSampleConfig();

describe('spa-app: ' + sampleConfig.name, () => {

  it('can login using redirect', async () => {
    await startApp(SpaApp, { requireUserSession: true });
    await loginRedirect(SpaApp);
    await SpaApp.assertUserInfo();
    await SpaApp.logoutRedirect();
  });

  it('can use memory token storage', async () => {
    await startApp(SpaApp, { requireUserSession: true, storage: 'memory' });
    await loginRedirect(SpaApp);
    await SpaApp.assertUserInfo();
    await SpaApp.logoutRedirect();
  });

  it('can get user info', async () => {
    await startApp(SpaApp, { requireUserSession: false });
    await loginRedirect(SpaApp);
    await SpaApp.assertNoUserInfo();
    await SpaApp.getUserInfo();
    await SpaApp.assertUserInfo();
    await SpaApp.logoutRedirect();
  });

  if (sampleConfig.signinForm) {
    it('can login directly, calling signin() with username and password', async () => {
      await startApp(SpaApp, { flow: 'form', requireUserSession: true });
      await loginDirect(SpaApp);
      await SpaApp.assertUserInfo();
      await SpaApp.logoutRedirect();
    });
  }

  if (sampleConfig.signinForm) {
    it('can login using a self-hosted widget', async () => {
      await startApp(SpaApp, { flow: 'widget', requireUserSession: true });
      await loginWidget();
      await SpaApp.assertUserInfo();
      await SpaApp.logoutRedirect();
    });
  }
});