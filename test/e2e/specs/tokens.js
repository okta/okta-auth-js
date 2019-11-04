import TestApp from '../pageobjects/TestApp';
import { flows, openImplicit, openPKCE } from '../util/appUtils';
import { loginPopup } from '../util/loginUtils';

describe('E2E token flows', () => {
  afterEach(() => {
    TestApp.logout();
  });

  flows.forEach(flow => {
    describe(flow + ' flow', () => {
      beforeEach(() => {
        (flow === 'pkce') ? openPKCE() : openImplicit();
      });

      it('can renew the id token', () => {
        loginPopup(flow);
        const prevToken = TestApp.idToken.getText();
        TestApp.renewToken();
        browser.waitUntil(() => {
          return TestApp.idToken.getText() !== prevToken;
        }, 10000);
        TestApp.assertLoggedIn();
      });

      it('can refresh all tokens', () => {
        loginPopup(flow);
        const prev = {
          idToken: TestApp.idToken.getText(),
          accessToken: TestApp.accessToken.getText(),
        }
        TestApp.getToken();
        browser.waitUntil(() => {
          return (
            TestApp.idToken.getText() !== prev.idToken &&
            TestApp.accessToken.getText() !== prev.accessToken
          );
        }, 10000);
        TestApp.assertLoggedIn();
      });
    });
  });
});