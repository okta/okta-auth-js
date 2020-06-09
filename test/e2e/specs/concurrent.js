import TestApp from '../pageobjects/TestApp';
import { openPKCE } from '../util/appUtils';
import { loginPopup } from '../util/loginUtils';

describe('concurrent API use', () => {
  beforeEach(async () => {
    await openPKCE();
    await loginPopup();
  });

  afterEach(async () => {
    await TestApp.logoutRedirect();
  });

  it('testConcurrentLogin', async () => {
    // clear local tokens, refresh the page
    await TestApp.logoutApp();

    // test concurrent login, we should not be prompted for credentials
    await TestApp.testConcurrentLogin();
    await TestApp.assertTokenMessage('concurrent test passed');
  });

  it('testConcurrentGetToken', async () => {
    await TestApp.testConcurrentGetToken();
    await TestApp.assertTokenMessage('concurrent test passed');
  });
});
