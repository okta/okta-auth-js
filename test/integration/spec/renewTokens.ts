import { createClient, signinAndGetTokens } from '../util';

jest.mock('../../../lib/oidc/getWithoutPrompt', () => {
  return {
    getWithoutPrompt: () => {}
  };
});

const mocked = {
  getWithoutPrompt: require('../../../lib/oidc/getWithoutPrompt')
};

describe('renewTokens', () => {

  function assertScopesMatch(tokenResponse, scopes) {
    const { accessToken, idToken } = tokenResponse;
    expect(accessToken.scopes.sort()).toEqual(scopes);
    expect(idToken.scopes.sort()).toEqual(scopes);
  }

  function assertHasClaims(tokenResponse, claims) {
    const { idToken } = tokenResponse;
    claims.forEach(claim => {
      expect(idToken.claims[claim]).toBeTruthy();
    });
  }

  function assertDoesNotHaveClaims(tokenResponse, claims) {
    const { idToken } = tokenResponse;
    claims.forEach(claim => {
      expect(idToken.claims[claim]).toBeFalsy();
    });
  }

  function mockGetWithoutPrompt(throwError?) {
    jest.spyOn(mocked.getWithoutPrompt, 'getWithoutPrompt').mockImplementation((client, tokenParams) => {
      if (throwError) {
        throw new Error('unexpected call to getWithoutPrompt');
      }
      // perform a full login flow. We cannot renew without prompt because we have no cookies.
      return signinAndGetTokens(client, tokenParams);
    });
  }  

  describe('using authorize endpoint', () => {
    it('renews with only an access token', async () => {
      const scopes = ['openid', 'profile'].sort();
      const client = createClient({ pkce: false, responseType: ['token'] });
      const { tokens: originalTokens } = await signinAndGetTokens(client, { scopes });
      expect(originalTokens.idToken).toBeUndefined();
      expect(originalTokens.accessToken.scopes.sort()).toEqual(scopes);
      client.tokenManager.setTokens(originalTokens);
      mockGetWithoutPrompt();
      const renewedTokens = await client.token.renewTokens();
      expect(mocked.getWithoutPrompt.getWithoutPrompt).toHaveBeenCalled();
      expect(originalTokens.accessToken.accessToken).not.toEqual(renewedTokens.accessToken.accessToken);
      expect(renewedTokens.idToken).toBeUndefined();
      expect(renewedTokens.accessToken.scopes.sort()).toEqual(scopes);
    });

    it('renews with only an id token', async () => {
      const scopes = ['openid', 'profile'].sort();
      const client = createClient({ pkce: false, responseType: ['id_token'] });
      const { tokens: originalTokens } = await signinAndGetTokens(client, { scopes });
      expect(originalTokens.accessToken).toBeUndefined();
      expect(originalTokens.idToken.scopes.sort()).toEqual(scopes);
      assertHasClaims(originalTokens, ['name']);
      assertDoesNotHaveClaims(originalTokens, ['email']);
      client.tokenManager.setTokens(originalTokens);
      mockGetWithoutPrompt();
      const renewedTokens = await client.token.renewTokens();
      expect(mocked.getWithoutPrompt.getWithoutPrompt).toHaveBeenCalled();
      expect(originalTokens.idToken.idToken).not.toEqual(renewedTokens.idToken.idToken);
      expect(renewedTokens.accessToken).toBeUndefined();
      expect(renewedTokens.idToken.scopes.sort()).toEqual(scopes);
      assertHasClaims(renewedTokens, ['name']);
      assertDoesNotHaveClaims(renewedTokens, ['email']);
    });

    it('renews with default scopes', async () => {
      const scopes = ['openid', 'email'].sort();
      const client = createClient({ pkce: false });
      const { tokens: originalTokens } = await signinAndGetTokens(client);
      assertScopesMatch(originalTokens, scopes);
      assertHasClaims(originalTokens, ['email']);
      assertDoesNotHaveClaims(originalTokens, ['name']);
      client.tokenManager.setTokens(originalTokens);
      mockGetWithoutPrompt();
      const renewedTokens = await client.token.renewTokens();
      expect(mocked.getWithoutPrompt.getWithoutPrompt).toHaveBeenCalled();
      expect(originalTokens.accessToken.accessToken).not.toEqual(renewedTokens.accessToken.accessToken);
      expect(originalTokens.idToken.idToken).not.toEqual(renewedTokens.idToken.idToken);
      assertScopesMatch(renewedTokens, scopes);
      assertHasClaims(renewedTokens, ['email']);
      assertDoesNotHaveClaims(renewedTokens, ['name']);
    });

    it('renews using the scopes passed into constructor', async () => {
      const scopes = ['openid', 'profile'].sort();
      const client = createClient({ scopes, pkce: false });
      const { tokens: originalTokens } = await signinAndGetTokens(client);
      assertScopesMatch(originalTokens, scopes);
      assertHasClaims(originalTokens, ['name']);
      assertDoesNotHaveClaims(originalTokens, ['email']);
      client.tokenManager.setTokens(originalTokens);
      mockGetWithoutPrompt();
      const renewedTokens = await client.token.renewTokens();
      expect(mocked.getWithoutPrompt.getWithoutPrompt).toHaveBeenCalled();
      expect(originalTokens.accessToken.accessToken).not.toEqual(renewedTokens.accessToken.accessToken);
      expect(originalTokens.idToken.idToken).not.toEqual(renewedTokens.idToken.idToken);
      assertScopesMatch(renewedTokens, scopes);
      assertHasClaims(renewedTokens, ['name']);
      assertDoesNotHaveClaims(renewedTokens, ['email']);
    });

    it('renews using the scopes passed into getTokens', async () => {
      const scopes = ['openid', 'profile'].sort();
      const client = createClient({ pkce: false });
      const { tokens: originalTokens } = await signinAndGetTokens(client, { scopes });
      assertScopesMatch(originalTokens, scopes);
      assertHasClaims(originalTokens, ['name']);
      assertDoesNotHaveClaims(originalTokens, ['email']);
      client.tokenManager.setTokens(originalTokens);
      mockGetWithoutPrompt();
      const renewedTokens = await client.token.renewTokens();
      expect(mocked.getWithoutPrompt.getWithoutPrompt).toHaveBeenCalled();
      expect(originalTokens.accessToken.accessToken).not.toEqual(renewedTokens.accessToken.accessToken);
      expect(originalTokens.idToken.idToken).not.toEqual(renewedTokens.idToken.idToken);
      assertScopesMatch(renewedTokens, scopes);
      assertHasClaims(renewedTokens, ['name']);
      assertDoesNotHaveClaims(renewedTokens, ['email']);
    });
  });

  describe('using token endpoint', () => {

    it('renews using the scopes passed into constructor', async () => {
      const scopes = ['offline_access', 'openid', 'profile'].sort();
      const client = createClient({ scopes, pkce: true });
      const { tokens: originalTokens } = await signinAndGetTokens(client);
      assertScopesMatch(originalTokens, scopes);
      assertHasClaims(originalTokens, ['name']);
      assertDoesNotHaveClaims(originalTokens, ['email']);
      client.tokenManager.setTokens(originalTokens);
      mockGetWithoutPrompt(true);
      const renewedTokens = await client.token.renewTokens();
      expect(originalTokens.accessToken.accessToken).not.toEqual(renewedTokens.accessToken.accessToken);
      expect(originalTokens.idToken.idToken).not.toEqual(renewedTokens.idToken.idToken);
      assertScopesMatch(renewedTokens, scopes);
      assertHasClaims(renewedTokens, ['name']);
      assertDoesNotHaveClaims(renewedTokens, ['email']);
    });

    it('renews using the scopes passed into getTokens', async () => {
      const scopes = ['offline_access', 'openid', 'profile'].sort();
      const client = createClient({ pkce: true });
      const { tokens: originalTokens } = await signinAndGetTokens(client, { scopes });
      assertScopesMatch(originalTokens, scopes);
      assertHasClaims(originalTokens, ['name']);
      assertDoesNotHaveClaims(originalTokens, ['email']);
      client.tokenManager.setTokens(originalTokens);
      mockGetWithoutPrompt(true);
      const renewedTokens = await client.token.renewTokens();
      expect(originalTokens.accessToken.accessToken).not.toEqual(renewedTokens.accessToken.accessToken);
      expect(originalTokens.idToken.idToken).not.toEqual(renewedTokens.idToken.idToken);
      assertScopesMatch(renewedTokens, scopes);
      assertHasClaims(renewedTokens, ['name']);
      assertDoesNotHaveClaims(renewedTokens, ['email']);
    });
  });
});
