import TestApp from '../pageobjects/TestApp';
import { flows, openImplicit, openPKCE } from '../util/appUtils';
import { loginRedirect, loginPopup, loginDirect } from '../util/loginUtils';

describe('E2E login', () => {
  afterEach(() => {
    TestApp.getUserInfo();
    TestApp.assertUserInfo();
    TestApp.logout();
  });

  flows.forEach(flow => {
    describe(flow + ' flow', () => {
      beforeEach(() => {
        (flow === 'pkce') ? openPKCE() : openImplicit();
      });

      it('can login using redirect', () => {
        loginRedirect(flow);
      });

      it('can login using a popup window', () => {
        loginPopup(flow);
      });

      it('can login directly, calling signin() with username and password', () => {
        loginDirect(flow);
      });
    });
  });
});