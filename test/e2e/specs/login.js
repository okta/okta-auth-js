import TestApp from '../pageobjects/TestApp';
import { flows, openImplicit, openPKCE } from '../util/appUtils';
import { loginRedirect, loginPopup, loginDirect } from '../util/loginUtils';

describe('E2E login', () => {
  afterEach(() => {
    TestApp.logout();
  });

  flows.forEach(flow => {
    describe(flow + ' flow', () => {
      beforeEach(() => {
        (flow === 'pkce') ? openPKCE() : openImplicit();
      });

      it('can login using redirect', () => {
        loginRedirect(flow);
        TestApp.getUserInfo();
        TestApp.assertUserInfo();
      });

      it('can login using a popup window', () => {
        loginPopup(flow);
        TestApp.getUserInfo();
        TestApp.assertUserInfo();
      });

      it('can login directly, calling signin() with username and password', () => {
        loginDirect(flow);
        TestApp.getUserInfo();
        TestApp.assertUserInfo();
      });
    });
  });
});