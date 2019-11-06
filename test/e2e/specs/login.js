import TestApp from '../pageobjects/TestApp';
import { flows, openImplicit, openPKCE } from '../util/appUtils';
import { loginRedirect, loginPopup, loginDirect } from '../util/loginUtils';

describe('E2E login', () => {

  flows.forEach(flow => {
    describe(flow + ' flow', () => {
      beforeEach(async () => {
        (flow === 'pkce') ? await openPKCE() : await openImplicit();
      });

      it('can login using redirect', async () => {
        await loginRedirect(flow);
        await TestApp.getUserInfo();
        await TestApp.assertUserInfo();
        await TestApp.logout();
      });

      it('can login using a popup window', async() => {
        await loginPopup(flow);
        await TestApp.getUserInfo();
        await TestApp.assertUserInfo();
        await TestApp.logout();
      });

      it('can login directly, calling signin() with username and password', async () => {
        await loginDirect(flow);
        await TestApp.getUserInfo();
        await TestApp.assertUserInfo();
        await TestApp.logout();
      });
    });
  });
});