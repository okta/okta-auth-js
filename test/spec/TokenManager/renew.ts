/* eslint-disable @typescript-eslint/no-explicit-any */
import tokens from '@okta/test.support/tokens';
import { AuthApiError, AuthSdkError, OAuthError } from '../../../lib/errors';
import { TokenManager } from '../../../lib/TokenManager';

const Emitter = require('tiny-emitter');

describe('TokenManager renew', () => {
  let testContext;

  beforeEach(function() {
    const emitter = new Emitter();
    const foo = tokens.standardAccessTokenParsed;
    const bar = tokens.standardIdTokenParsed;
    const storage = {
      foo,
      bar
    };
    const tokenStorage = {
        getStorage: jest.fn().mockImplementation(() => testContext.storage),
        setStorage: jest.fn().mockImplementation(() => {})
    };
    const sdkMock = {
      options: {},
      token: {
        renewTokens: jest.fn().mockImplementation(() => Promise.resolve(testContext.freshTokens)),
        renewToken: jest.fn().mockImplementation(() => Promise.resolve(foo))
      },
      storageManager: {
        getTokenStorage: jest.fn().mockReturnValue(tokenStorage),
      },
      emitter
    };

    const instance = new TokenManager(sdkMock as any);
    jest.spyOn(instance, 'setTokens');
    jest.spyOn(instance, 'add');
    jest.spyOn(instance, 'remove').mockImplementation(() => {});
    jest.spyOn(instance, 'emitRenewed').mockImplementation(() => {});
    jest.spyOn(instance, 'emitError').mockImplementation(() => {});

    testContext = {
      sdkMock,
      tokenStorage,
      storage,
      instance,
      oldTokens: {
        accessToken: foo,
        idToken: bar
      },
      freshTokens: {
        idToken: Object.assign({}, tokens.standardIdTokenParsed),
        accessToken: Object.assign({}, tokens.standardAccessTokenParsed)
      },
    };
    
  });

  it('calls token.renewTokens and returns the fresh token', async () => {
    const res = await testContext.instance.renew('foo');
    expect(testContext.sdkMock.token.renewTokens).toHaveBeenCalled();
    expect(testContext.sdkMock.token.renewToken).not.toHaveBeenCalled();
    expect(res).toBe(testContext.freshTokens.accessToken);
  });

  it('adds the new token to storage', async () => {
    await testContext.instance.renew('foo');
    expect(testContext.instance.setTokens).toHaveBeenCalledWith(testContext.freshTokens);
    expect(testContext.instance.add).not.toHaveBeenCalled();
  });

  it('emits two renewed events', async () => {
    await testContext.instance.renew('foo');
    expect(testContext.instance.emitRenewed).toHaveBeenNthCalledWith(1, 'bar', testContext.freshTokens.idToken, testContext.oldTokens.idToken);
    expect(testContext.instance.emitRenewed).toHaveBeenNthCalledWith(2, 'foo', testContext.freshTokens.accessToken, testContext.oldTokens.accessToken);
  });

  describe('error handling', () => {
    beforeEach(() => {
      jest.spyOn(testContext.sdkMock.token, 'renewTokens').mockImplementation(() => Promise.reject(testContext.error));
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