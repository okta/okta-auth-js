/* eslint-disable @typescript-eslint/no-explicit-any */
import tokens from '@okta/test.support/tokens';
import { 
  OktaAuth, 
  TOKEN_STORAGE_NAME,
  SYNC_STORAGE_NAME
} from '../../../lib';
import { AuthApiError, AuthSdkError, OAuthError } from '../../../lib/errors';
import { TokenManager } from '../../../lib/TokenManager';

/* global window, StorageEvent */

const Emitter = require('tiny-emitter');

describe('TokenManager renew', () => {
  let testContext;
  // syncStorage is shared (simulate LocalStorage which is shared across tabs)
  let syncStorageMap = {};
  let sharedTokenMap = {};
  const syncStorage = {
    getItem: jest.fn().mockImplementation((k) => syncStorageMap[k]),
    setItem: jest.fn().mockImplementation((k, v) => {
      const oldValue = JSON.stringify(syncStorageMap);
      syncStorageMap[k] = v;
      const newValue = JSON.stringify(syncStorageMap);
      console.log('eeeeee  set', {
        key: SYNC_STORAGE_NAME, 
        newValue,
        oldValue,
      });
      if (typeof window === 'undefined') {
        return;
      }
      window.dispatchEvent(new StorageEvent('storage', {
        key: SYNC_STORAGE_NAME, 
        newValue,
        oldValue,
      }));
    }),
    removeItem: jest.fn().mockImplementation((k) => {
      const oldValue = JSON.stringify(syncStorageMap);
      delete syncStorageMap[k];
      const newValue = JSON.stringify(syncStorageMap);
      console.log('eeeeee  remove', {
        key: SYNC_STORAGE_NAME, 
        newValue,
        oldValue,
      });
      if (typeof window === 'undefined') {
        return;
      }
      window.dispatchEvent(new StorageEvent('storage', {
        key: SYNC_STORAGE_NAME, 
        newValue,
        oldValue,
      }));
    }),
  };
  const sharedTokenStorage = {
    getStorage: jest.fn().mockImplementation(() => sharedTokenMap),
    setStorage: jest.fn().mockImplementation((v) => { sharedTokenMap = v; })
  };

  const createContext = (tokenStorage?) => {
    let testContext;

    const emitter = new Emitter();
    if (!tokenStorage) {
      tokenStorage = {
          getStorage: jest.fn().mockImplementation(() => testContext.storage),
          setStorage: jest.fn().mockImplementation(() => {})
      };
    }
    const sdkMock = {
      options: {},
      token: {
        renewTokens: jest.fn().mockImplementation(() => Promise.resolve(testContext.freshTokens))
      },
      storageManager: {
        getTokenStorage: jest.fn().mockReturnValue(tokenStorage),
        getSyncStorage: jest.fn().mockReturnValue(syncStorage),
      },
      emitter
    };

    const instance = new TokenManager(sdkMock as any, {
      _storageEventDelay: 0
    });
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

    return testContext;
  };

  beforeEach(function() {
    syncStorageMap = {};
    sharedTokenMap = {};
    testContext = createContext();
  });

  describe('cross tabs', () => {
    it('works for 2 tabs', async () => {
      console.log('-------------- start');
      sharedTokenStorage.setStorage(testContext.storage);
      const tabs = [...Array(2)].map(_ => createContext(sharedTokenStorage));
      tabs.map(c => c.instance.start());

      const renewPromises = tabs.map(c => c.instance.renew('idToken'));
      const res = await Promise.allSettled(renewPromises);

      res.map(r => {
        expect(r.status).toBe('fulfilled');
        expect((r as any).value).toMatchObject(testContext.freshTokens.idToken);
      });
      
      const renewTokensCalls = tabs.map(c => c.sdkMock.token.renewTokens.mock.calls.length).reduce((v, c) => (c + v), 0);
      expect(renewTokensCalls).toEqual(1);

      tabs.map(c => c.instance.stop());
      console.log('-------------- end');
    });

    // todo: simulate race

    // todo: what if error ?
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

    it('OAuthError', async () => {
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

    it('AuthSdkError', async () => {
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

    it('Refresh token error', async () => {
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

  });

});
