/* eslint-disable @typescript-eslint/no-explicit-any */
import tokens from '@okta/test.support/tokens';
import { 
  OktaAuth, 
  TOKEN_STORAGE_NAME,
} from '../../../lib';
import { AuthApiError, AuthSdkError, OAuthError } from '../../../lib/errors';
import { TokenManager } from '../../../lib/TokenManager';

const Emitter = require('tiny-emitter');

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
        renewTokens: () => Promise.resolve(testContext.freshTokens)
      },
      storageManager: {
        getTokenStorage: jest.fn().mockReturnValue(tokenStorage),
      },
      emitter
    };

    const instance = new TokenManager(sdkMock as any);
    jest.spyOn(instance, 'setTokens');
    jest.spyOn(instance, 'remove').mockImplementation(() => {});
    jest.spyOn(instance, 'emitRenewed').mockImplementation(() => {});
    jest.spyOn(instance, 'emitError').mockImplementation(() => {});
    
    const storage = {
      idToken: tokens.standardIdTokenParsed
    };

    testContext = {
      sdkMock,
      tokenStorage,
      storage,
      instance,
      oldToken: tokens.standardIdTokenParsed,
      freshTokens: {
        idToken: tokens.standardIdToken2Parsed
      }
    };
    
  });

  it('returns the fresh token', async () => {
    const res = await testContext.instance.renew('idToken');
    expect(res).toBe(testContext.freshTokens.idToken);
  });

  it('sets the new tokens to storage', async () => {
    await testContext.instance.renew('idToken');
    expect(testContext.instance.setTokens).toHaveBeenCalledWith(testContext.freshTokens);
  });

  it('emits a renewed event', async () => {
    await testContext.instance.renew('idToken');
    expect(testContext.instance.emitRenewed).toHaveBeenCalledWith('idToken', testContext.freshTokens.idToken, testContext.oldToken);
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
      jest.spyOn(authClient.token, 'renewTokens').mockResolvedValue(freshTokens);
      jest.spyOn(authClient.tokenManager, 'hasExpired').mockImplementation(token => !!token.expired);
    });

    it('produce consistent isAuthenticated state when renew happens in sequence', async () => {
      const handler = jest.fn();
      authClient.authStateManager.subscribe(handler);
  
      await authClient.tokenManager.renew('idToken');
      await authClient.tokenManager.renew('accessToken');
  
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({
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
      jest.spyOn(testContext.sdkMock.token, 'renewTokens').mockImplementation(() => Promise.reject(testContext.error));
    });

    it('on OAuthError, should remove token and emit error', async () => {
      testContext.error = new OAuthError('does not matter', 'also not important');
      try {
        await testContext.instance.renew('idToken');
      } catch (e) {
        expect(e).toMatchObject({
          name: 'OAuthError'
        });
      }
      expect(testContext.instance.remove).toHaveBeenCalledWith('idToken');
      expect(testContext.instance.emitError).toHaveBeenCalledWith(testContext.error);
      expect(testContext.error.tokenKey).toBe('idToken');
    });

    it('on AuthSdkError, should remove token and emit error', async () => {
      testContext.error = new AuthSdkError('does not matter');
      try {
        await testContext.instance.renew('idToken');
      } catch (e) {
        expect(e).toMatchObject({
          name: 'AuthSdkError'
        });
      }
      expect(testContext.instance.remove).toHaveBeenCalledWith('idToken');
      expect(testContext.instance.emitError).toHaveBeenCalledWith(testContext.error);
      expect(testContext.error.tokenKey).toBe('idToken');
    });

    it('on refresh token error, should remove token and emit error', async () => {
      testContext.error = new AuthApiError({
        errorSummary: 'does not matter'
      }, {
        status: 400,
        responseText: 'does not matter',
        responseJSON: {
          error: 'invalid_grant'
        },
        headers: {}
      });
      try {
        await testContext.instance.renew('idToken');
      } catch (e) {
        expect(e).toMatchObject({
          name: 'AuthApiError'
        });
      }
      expect(testContext.instance.remove).toHaveBeenCalledWith('idToken');
      expect(testContext.instance.emitError).toHaveBeenCalledWith(testContext.error);
      expect(testContext.error.tokenKey).toBe('idToken');
    });

    it('on other error, should remove token and emit error', async () => {
      testContext.error = new AuthApiError({
        errorSummary: 'Not Found'
      }, {
        status: 404,
        responseText: 'Not Found',
        headers: {}
      });
      try {
        await testContext.instance.renew('idToken');
      } catch (e) {
        expect(e).toMatchObject({
          name: 'AuthApiError'
        });
      }
      expect(testContext.instance.remove).toHaveBeenCalledWith('idToken');
      expect(testContext.instance.emitError).toHaveBeenCalledWith(testContext.error);
      expect(testContext.error.tokenKey).toBe('idToken');
    });

  });

});
