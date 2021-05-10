import {
  // toQueryString,
  getSampleConfig,
  // getConfig,
} from '../util';
import startApp from '../support/action/startApp';
import checkProfile from '../support/check/checkProfile';
import loginDirect from '../support/action/loginDirect';
import loginWidget from '../support/action/loginWidget';
import loginRedirect from '../support/action/loginRedirect';
import logoutRedirect from '../support/action/logoutRedirect';
// import clickSocialLoginButtons from '../support/action/clickSocialLoginButtons';

const sampleConfig = getSampleConfig();
// const config = getConfig();

describe('spa-app: ' + sampleConfig.name, () => {

  it('can login using redirect', async () => {
    await startApp('/', { requireUserSession: true });
    await loginRedirect();
    await checkProfile({ clickProfileButton: false });
    await logoutRedirect();
  });

  it('can use memory token storage', async () => {
    await startApp('/', { requireUserSession: true, storage: 'memory' });
    await loginRedirect();
    await checkProfile({ clickProfileButton: false });
    await logoutRedirect();
  });

  it('can get user info', async () => {
    await startApp('/', { requireUserSession: false });
    await loginRedirect();
    await checkProfile({ clickProfileButton: false, falseCase: true });
    await checkProfile({ clickProfileButton: true });
    await logoutRedirect();
  });

  if (sampleConfig.signinForm) {
    it('can login directly, calling signin() with username and password', async () => {
      await startApp('/', { flow: 'form', requireUserSession: true });
      await loginDirect();
      await checkProfile({ clickProfileButton: false });
      await logoutRedirect();
    });
  }

  if (sampleConfig.signinWidget) {
    it('can login using a self-hosted widget', async () => {
      await startApp('/', { flow: 'widget' });
      await loginWidget();
      await checkProfile();
      await logoutRedirect();
    });
  
    // TODO: enable these tests
    // it('does not show the widget when receiving error=access_denied on redirect', async () => {
    //   await startApp('/', { flow: 'widget' });
    //   await browser.url(sampleConfig.redirectPath + toQueryString(Object.assign({
    //     error: 'access_denied'
    //   }, config)));

    //   await loginWidget();
    //   await checkProfile();
    //   await logoutRedirect();
    // });

    // it('shows the widget when receiving error=interaction_required on redirect', async () => {
    //   await startApp('/', { flow: 'widget' });
    //   await browser.url(sampleConfig.redirectPath + toQueryString({
    //     error: 'interaction_required'
    //   }));

    //   await loginWidget();
    //   await checkProfile();
    //   await logoutRedirect();
    // });

    // it('show social login buttons in self-hosted widget', async () => {
    //   await startApp('/', { flow: 'widget', idps: 'Facebook:111 Google:222' });
    //   await clickSocialLoginButtons();
    // });
  }
});