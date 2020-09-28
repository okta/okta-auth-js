import assert from 'assert';
import TestApp from '../pageobjects/TestApp';
import { flows, openImplicit, openPKCE } from '../util/appUtils';
import { loginWidget, loginRedirect, loginPopup, loginDirect } from '../util/loginUtils';

describe('E2E login', () => {

  // responseMode=query is not supported for implicit flow
  it('PKCE: can login using redirect with responseMode=fragment', async () => {
    await openPKCE({ responseMode: 'fragment' });
    await TestApp.responseModeFragment.then(el => el.isSelected()).then(isSelected => {
      assert(isSelected === true);
    });
    await loginRedirect('pkce', 'fragment');
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();
    await TestApp.logoutRedirect();
  });

  flows.forEach(flow => {
    describe(flow + ' flow', () => {
      beforeEach(async () => {
        (flow === 'pkce') ? await openPKCE() : await openImplicit();
      });

      it('can login using signin widget', async () => {
        await loginWidget(flow);
        await TestApp.getUserInfo();
        await TestApp.assertUserInfo();
        await TestApp.logoutRedirect();
      });

      it('can login using redirect', async () => {
        await loginRedirect(flow);
        await TestApp.getUserInfo();
        await TestApp.assertUserInfo();
        await TestApp.logoutRedirect();
      });

      it('can login using a popup window', async() => {
        await loginPopup(flow);
        await TestApp.getUserInfo();
        await TestApp.assertUserInfo();
        await TestApp.logoutRedirect();
      });

      it('can login directly, calling signin() with username and password', async () => {
        await loginDirect(flow);
        await TestApp.getUserInfo();
        await TestApp.assertUserInfo();
        await TestApp.logoutRedirect();
      });
    });
  });
});