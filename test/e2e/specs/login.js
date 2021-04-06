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
    await TestApp.interactionCodeOption.then(el => el.click());
    await loginRedirect('pkce', 'fragment');
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();
    await TestApp.logoutRedirect();
  });

  flows.forEach(flow => {
    describe(flow + ' flow', () => {
      async function bootstrap(options = {}) {
        (flow === 'pkce') ? await openPKCE(options) : await openImplicit(options);
      }

      it('can login using signin widget (no redirect)', async () => {
        let options = {};
        if (process.env.ORG_OIE_ENABLED && flow === 'pkce') {
          options = { useInteractionCodeFlow: true };
        }
        await bootstrap(options);
        await loginWidget(flow);
        await TestApp.getUserInfo();
        await TestApp.assertUserInfo();
        await TestApp.logoutRedirect();
      });

      it('can login using signin widget (with redirect)', async () => {
        let options = { _forceRedirect: true };
        if (process.env.ORG_OIE_ENABLED && flow === 'pkce') {
          options = Object.assign({ useInteractionCodeFlow: true }, options);
        }
        await bootstrap(options);
        await loginWidget(flow, true);
        await TestApp.getUserInfo();
        await TestApp.assertUserInfo();
        await TestApp.logoutRedirect();
      });

      it('can login using redirect', async () => {
        await bootstrap();
        await loginRedirect(flow);
        await TestApp.getUserInfo();
        await TestApp.assertUserInfo();
        await TestApp.logoutRedirect();
      });

      it('can login using a popup window', async() => {
        await bootstrap();
        await loginPopup(flow);
        await TestApp.getUserInfo();
        await TestApp.assertUserInfo();
        await TestApp.logoutRedirect();
      });

      it('can login directly, calling signin() with username and password', async () => {
        await bootstrap();
        await loginDirect(flow);
        await TestApp.getUserInfo();
        await TestApp.assertUserInfo();
        await TestApp.logoutRedirect();
      });
    });
  });
});