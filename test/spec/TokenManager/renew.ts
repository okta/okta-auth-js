/* eslint-disable @typescript-eslint/no-explicit-any */
// import { OktaAuth } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import { 
  OktaAuth, 
  TOKEN_STORAGE_NAME, 
  Token, 
  TokenType, 
  isAccessToken, 
  isIDToken, 
  isRefreshToken 
} from '../../../lib';
import { AuthApiError, AuthSdkError, OAuthError } from '../../../lib/errors';
import { TokenManager } from '../../../lib/TokenManager';

const Emitter = require('tiny-emitter');

// TODO: move to TokenManager in the next minor version - OKTA-414643
function getTokenType(token: Token): TokenType {
  if (isAccessToken(token)) {
    return 'accessToken';
  }
  if (isIDToken(token)) {
    return 'idToken';
  }
  if(isRefreshToken(token)) {
    return 'refreshToken';
  }
  throw new AuthSdkError('Unknown token type');
}

describe('TokenManager renew', () => {
  let testContext;

  beforeEach(function() {
    const emitter = new Emitter();
    const tokenStorage = {
        getStorage: jest.fn().mockImplementation(() => testContext.storage),
        setStorage: jest.fn().mockImplementation(() => {})
    };
    const sdkMock = {
      options: {},
      token: {
        renew: () => Promise.resolve(testContext.freshToken)
      },
      storageManager: {
        getTokenStorage: jest.fn().mockReturnValue(tokenStorage),
      },
      emitter
    };

    const instance = new TokenManager(sdkMock as any);
    jest.spyOn(instance, 'remove').mockImplementation(() => {});
    jest.spyOn(instance, 'add').mockImplementation(() => {});
    jest.spyOn(instance, 'emitRenewed').mockImplementation(() => {});
    jest.spyOn(instance, 'emitError').mockImplementation(() => {});
    
    const foo = {};
    const bar = {};
    const storage = {
      foo,
      bar
    };

    testContext = {
      sdkMock,
      tokenStorage,
      storage,
      instance,
      oldToken: foo,
      freshToken: {
        idToken: true
      }
    };
    
  });

  it('returns the fresh token', async () => {
    const res = await testContext.instance.renew('foo');
    expect(res).toBe(testContext.freshToken);
  });

  it('removes the old token from storage', async () => {
    await testContext.instance.renew('foo');
    expect(testContext.instance.remove).toHaveBeenCalledWith('foo');
  });

  it('adds the new token to storage', async () => {
    await testContext.instance.renew('foo');
    expect(testContext.instance.add).toHaveBeenCalledWith('foo', testContext.freshToken);
  });

  it('emits a renewed event', async () => {
    await testContext.instance.renew('foo');
    expect(testContext.instance.emitRenewed).toHaveBeenCalledWith('foo', testContext.freshToken, testContext.oldToken);
  });

  describe('multiple token renew operations', () => {
    const expiredTokens = {
      idToken: { ...tokens.standardIdTokenParsed, expired: true },
      accessToken: { ...tokens.standardAccessTokenParsed, expired: true }
    };
    const freshTokens = {
      idToken: { ...tokens.standardIdTokenParsed },
      accessToken: { ...tokens.standardAccessTokenParsed }
    };

    let authClient: OktaAuth;
    beforeEach(() => {
      const mockTokenStore = {};
      const storageProvider = {
        getItem: (key) => mockTokenStore[key],
        setItem: (key, val) => mockTokenStore[key] = val
      };
      authClient = new OktaAuth({
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect',
        tokenManager: {
          autoRenew: false,
          storage: storageProvider
        },
      });
      // preset expired token in storage
      storageProvider.setItem(TOKEN_STORAGE_NAME, JSON.stringify(expiredTokens));
      // mock functions
      jest.spyOn(authClient.token, 'renew').mockImplementation((token) => {
        const type = getTokenType(token);
        return Promise.resolve(freshTokens[type]);
      });
      jest.spyOn(authClient.tokenManager, 'hasExpired').mockImplementation(token => !!token.expired);
    });

    it('produce consistent isAuthenticated state when renew happens in sequence', async () => {
      const handler = jest.fn();
      authClient.authStateManager.subscribe(handler);
  
      await authClient.tokenManager.renew('idToken');
      await authClient.tokenManager.renew('accessToken');
  
      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(1, {
        accessToken: expiredTokens.accessToken,
        idToken: freshTokens.idToken,
        isAuthenticated: true
      });
      expect(handler).toHaveBeenNthCalledWith(2, {
        accessToken: freshTokens.accessToken,
        idToken: freshTokens.idToken,
        isAuthenticated: true
      });
    });

    it('produces consistent isAuthenticated state when renew happens in parallel', async () => {
      const handler = jest.fn();
      authClient.authStateManager.subscribe(handler);

      await Promise.all([
        authClient.tokenManager.renew('idToken'),
        authClient.tokenManager.renew('accessToken')
      ]);

      // AuthStateManager cancelled one event
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({
        accessToken: freshTokens.accessToken,
        idToken: freshTokens.idToken,
        isAuthenticated: true
      });
    });

  });

  describe('error handling', () => {
    beforeEach(() => {
      jest.spyOn(testContext.sdkMock.token, 'renew').mockImplementation(() => Promise.reject(testContext.error));
    });

    it('OAuthError', async () => {
      testContext.error = new OAuthError('does not matter', 'also not important');
      try {
        await testContext.instance.renew('foo');
      } catch (e) {
        expect(e).toMatchObject({
          name: 'OAuthError'
        });
      }
      expect(testContext.instance.remove).toHaveBeenCalledWith('foo');
      expect(testContext.instance.emitError).toHaveBeenCalledWith(testContext.error);
      expect(testContext.error.tokenKey).toBe('foo');
    });

    it('AuthSdkError', async () => {
      testContext.error = new AuthSdkError('does not matter');
      try {
        await testContext.instance.renew('foo');
      } catch (e) {
        expect(e).toMatchObject({
          name: 'AuthSdkError'
        });
      }
      expect(testContext.instance.remove).toHaveBeenCalledWith('foo');
      expect(testContext.instance.emitError).toHaveBeenCalledWith(testContext.error);
      expect(testContext.error.tokenKey).toBe('foo');
    });

    it('Refresh token error', async () => {
      testContext.error = new AuthApiError({
        errorSummary: 'does not matter'
      }, {
        status: 400,
        responseText: 'does not matter',
        responseJSON: {
          error: 'invalid_grant'
        }
      });
      try {
        await testContext.instance.renew('foo');
      } catch (e) {
        expect(e).toMatchObject({
          name: 'AuthApiError'
        });
      }
      expect(testContext.instance.remove).toHaveBeenCalledWith('foo');
      expect(testContext.instance.emitError).toHaveBeenCalledWith(testContext.error);
      expect(testContext.error.tokenKey).toBe('foo');
    });

  });

});
