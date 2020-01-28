import assert from 'assert';
import TestApp from '../pageobjects/TestApp';
import { flows, openImplicit, openPKCE } from '../util/appUtils';
import { loginRedirect, loginPopup, loginDirect } from '../util/loginUtils';

describe('E2E login', () => {

  // responseMode=query is not supported for implicit flow
  it('can login using redirect (responseMode=query)', async () => {
    await openPKCE({ responseMode: 'query' });
    await TestApp.responseModeQuery.then(el => el.isSelected()).then(isSelected => {
      assert(isSelected === true);
    });
    await loginRedirect('pkce', 'query');
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();
    await TestApp.logout();
  });

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