import TestApp from '../pageobjects/TestApp';
import { loginDirect } from '../util/loginUtils';
import { getOidcHash } from '../../../build/cjs/crypto';
import assert from 'assert';

describe('Token auto renew', () => {
  beforeEach(async () => {
    await TestApp.open();
    await TestApp.startService();
    await TestApp.subscribeToAuthState();
  });

  it('idToken should match wih accessToken after auto renew', async () => {
    await loginDirect();
    await TestApp.waitForIdTokenRenew();
    const idToken = await TestApp.getIdToken();
    const accessToken = await TestApp.getAccessToken();
    const hash = await getOidcHash(accessToken.accessToken);
    assert(hash === idToken.claims.at_hash);
  });
});
