import SpaApp from '../pageobjects/SpaApp';
import {
  startApp,
  toQueryString,
  getSampleConfig,
  getConfig,
  loginRedirect,
  loginDirect,
  loginWidget,
  clickSocialLoginButtons
} from '../util';

const sampleConfig = getSampleConfig();
const config = getConfig();

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

  if (sampleConfig.signinWidget) {
    it('can login using a self-hosted widget', async () => {
      await startApp(SpaApp, { flow: 'widget', requireUserSession: true });
      await loginWidget();
      await SpaApp.assertUserInfo();
      await SpaApp.logoutRedirect();
    });

    it('does not show the widget when receiving error=access_denied on redirect', async () => {
      await startApp(SpaApp, { flow: 'widget' });
      await browser.url(sampleConfig.redirectPath + toQueryString(Object.assign({
        error: 'access_denied'
      }, config)));

      await loginWidget();
      await SpaApp.assertUserInfo();
      await SpaApp.logoutRedirect();
    });

    it('shows the widget when receiving error=interaction_required on redirect', async () => {
      await startApp(SpaApp, { flow: 'widget' });
      await browser.url(sampleConfig.redirectPath + toQueryString({
        error: 'interaction_required'
      }));

      await loginWidget();
      await SpaApp.assertUserInfo();
      await SpaApp.logoutRedirect();
    });
  }

  if (sampleConfig.signinWidget) {
    it('show social login buttons in self-hosted widget', async () => {
      await startApp(SpaApp, { flow: 'widget', requireUserSession: true, idps: 'Facebook:111 Google:222' });
      await clickSocialLoginButtons();
    });
  }
});