import EmbeddedAuthWithSDKApp from '../pageobjects/EmbeddedAuthWithSDKApp';
import { startApp } from '../util';

describe('express-embedded-auth-with-sdk', () => {

  it('can handle general login callback error', async () => {
    await startApp(EmbeddedAuthWithSDKApp);
    await browser.url('/login/callback?error=X&error_description=Y');
    await EmbeddedAuthWithSDKApp.assertLoginCallbackFailure('X: Y');
  });

});
