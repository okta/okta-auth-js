/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


/* eslint-disable max-statements */
/* global window, localStorage, sessionStorage */

const mocked = {
  features: {
    isHTTPS: () => true,
    isBrowser: () => typeof window !== 'undefined',
    isIE11OrLess: () => false,
    isLocalhost: () => false,
    isTokenVerifySupported: () => true,
    isSafari18: () => false
  }
};
jest.mock('../../../lib/features', () => {
  return mocked.features;
});

import { OktaAuth, AuthSdkError } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import util from '@okta/test.support/util';
import oauthUtil from '@okta/test.support/oauthUtil';
import SdkClock from '../../../lib/clock';
import { TokenManager } from '../../../lib/oidc/TokenManager';

describe('TokenManager (browser)', function() {
  let client;

  // Expected settings on HTTPS
  const secureCookieSettings = {
    secure: true,
    sameSite: 'none'
  };

  function createAuth(options) {
    options = Object.assign({}, options);
    options.tokenManager = Object.assign({}, options.tokenManager);
    options.cookies = Object.assign({}, options.cookies);
    options.storageManager = Object.assign({}, options.storageManager);
    jest.spyOn(SdkClock, 'create').mockReturnValue(new SdkClock(options.localClockOffset));
    return new OktaAuth({
      cookies: options.cookies,
      pkce: false,
      issuer: 'https://auth-js-test.okta.com',
      clientId: 'NPSfOkH5eZrTy8PMDlvx',
      redirectUri: 'https://example.com/redirect',
      storageUtil: options.storageUtil,
      storageManager: options.storageManager,
      tokenManager: {
        expireEarlySeconds: options.tokenManager.expireEarlySeconds || 0,
        storage: options.tokenManager.storage,
        storageKey: options.tokenManager.storageKey,
        autoRenew: options.tokenManager.autoRenew || false,
        autoRemove: options.tokenManager.autoRemove || false,
        secure: options.tokenManager.secure // used by cookie storage
      },
      responseType: options.responseType,
    });
  }

  async function setup(options = {}, start = false) {
    client = createAuth(options);
    // clear downstream listeners
    client.tokenManager.off('added');
    client.tokenManager.off('removed');
    if (start) {
      util.disableLeaderElection();
      util.mockLeader();
      client.tokenManager.start();
      await client.serviceManager.start();
    }
    return client;
  }
  
  beforeEach(function() {
    client = null;
    localStorage.clear();
    sessionStorage.clear();
  });
  
  afterEach(async () => {
    client?.tokenManager?.stop();
    await client?.serviceManager?.stop();
  });

  describe('options', () => {
    it('defaults to localStorage', async function() {
      await setup();
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      oauthUtil.expectTokenStorageToEqual(localStorage, {
        'test-idToken': tokens.standardIdTokenParsed
      });
    });
    it('honors StorageManager configuration', async function () {
      await setup({
        storageManager: {
          token: {
            storageTypes: ['cookie'],
            useSeparateCookies: true
          }
        }
      });
      var setCookieMock = util.mockSetCookie();
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      expect(setCookieMock).toHaveBeenCalledWith(
        'okta-token-storage_test-idToken',
        JSON.stringify(tokens.standardIdTokenParsed),
        '2200-01-01T00:00:00.000Z',
        secureCookieSettings
      );
    });
    it('favors token.storage configuration over storageManager.token', async function () {
      await setup({
        storageManager: {
          token: {
            storageTypes: ['cookie'],
          }
        },
        tokenManager: {
          storage: 'sessionStorage',
        }
      });
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      oauthUtil.expectTokenStorageToEqual(sessionStorage, {
        'test-idToken': tokens.standardIdTokenParsed
      });
    });
    it('defaults to sessionStorage if localStorage isn\'t available', async function () {
      const console = util.getConsole();
      jest.spyOn(console, 'warn');
      oauthUtil.mockLocalStorageError();
      await setup();
      expect(console.warn).toHaveBeenCalledWith(
        '[okta-auth-sdk] WARN: This browser doesn\'t ' +
        'support localStorage. Switching to sessionStorage.'
      );
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      oauthUtil.expectTokenStorageToEqual(sessionStorage, {
        'test-idToken': tokens.standardIdTokenParsed
      });
    });
    it('defaults to sessionStorage if localStorage cannot be written to', async function () {
      const console = util.getConsole();
      jest.spyOn(console, 'warn');
      oauthUtil.mockStorageSetItemError();
      await setup();
      expect(console.warn).toHaveBeenCalledWith(
        '[okta-auth-sdk] WARN: This browser doesn\'t ' +
        'support localStorage. Switching to sessionStorage.'
      );
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      oauthUtil.expectTokenStorageToEqual(sessionStorage, {
        'test-idToken': tokens.standardIdTokenParsed
      });
    });
    it('defaults to cookie-based storage if localStorage and sessionStorage are not available', async function () {
      const console = util.getConsole();
      jest.spyOn(console, 'warn');
      oauthUtil.mockLocalStorageError();
      oauthUtil.mockSessionStorageError();
      await setup();
      expect(console.warn).toHaveBeenCalledWith(
        '[okta-auth-sdk] WARN: This browser doesn\'t ' +
        'support sessionStorage. Switching to cookie.'
      );
      var setCookieMock = util.mockSetCookie();
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      expect(setCookieMock).toHaveBeenCalledWith(
        'okta-token-storage_test-idToken',
        JSON.stringify(tokens.standardIdTokenParsed),
        '2200-01-01T00:00:00.000Z',
        secureCookieSettings
      );
    });
    it('defaults to cookie-based storage if sessionStorage cannot be written to', async function () {
      const console = util.getConsole();
      jest.spyOn(console, 'warn');
      oauthUtil.mockLocalStorageError();
      oauthUtil.mockStorageSetItemError();
      await setup({
        tokenManager: {
          storage: 'sessionStorage'
        }
      });
      expect(console.warn).toHaveBeenCalledWith(
        '[okta-auth-sdk] WARN: This browser doesn\'t ' +
        'support sessionStorage. Switching to cookie.'
      );
      var setCookieMock = util.mockSetCookie();
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      expect(setCookieMock).toHaveBeenCalledWith(
        'okta-token-storage_test-idToken',
        JSON.stringify(tokens.standardIdTokenParsed),
        null,
        secureCookieSettings
      );
    });
    it('should be locked with default expireEarlySeconds for non-dev env', async() => {
      jest.spyOn(mocked.features, 'isLocalhost').mockReturnValue(false);
      await setup();
      const options = {
        expireEarlySeconds: 60
      };
      const instance = new TokenManager(client, options);
      expect(instance.getOptions().expireEarlySeconds).toBe(30);
    });
    it('should be able to set expireEarlySeconds for dev env', async () => {
      jest.spyOn(mocked.features, 'isLocalhost').mockReturnValue(true);
      await setup();
      const options = {
        expireEarlySeconds: 60
      };
      const instance = new TokenManager(client, options);
      expect(instance.getOptions().expireEarlySeconds).toBe(60);
    });
  });

  describe('renew', () => {
    beforeEach(async () => {
      jest.spyOn(mocked.features, 'isLocalhost').mockReturnValue(true);
      await setup({}, true);
    });

    it('throws an errors when a token doesn\'t exist', () => {
      const error = {
        name: 'AuthSdkError',
        message: 'The tokenManager has no token for the key: test-accessToken',
        errorCode: 'INTERNAL',
        errorSummary: 'The tokenManager has no token for the key: test-accessToken',
        errorLink: 'INTERNAL',
        errorId: 'INTERNAL',
        errorCauses: []
      };
      return oauthUtil.setupFrame({
        willFail: true,
        authClient: client,
        tokenManagerRenewArgs: ['test-accessToken']
      })
      .catch(function(e) {
        util.expectErrorToEqual(e, error);
      });
    });

    it('throws an errors when the token is mangled', function() {
      localStorage.setItem('okta-token-storage', '#unparseableJson#');
      return oauthUtil.setupFrame({
        authClient: client,
        willFail: true,
        tokenManagerRenewArgs: ['test-accessToken']
      })
      .then(function() {
        expect(true).toEqual(false);
      })
      .catch(function(err) {
        util.expectErrorToEqual(err, {
          name: 'AuthSdkError',
          message: 'Unable to parse storage string: okta-token-storage',
          errorCode: 'INTERNAL',
          errorSummary: 'Unable to parse storage string: okta-token-storage',
          errorLink: 'INTERNAL',
          errorId: 'INTERNAL',
          errorCauses: []
        });
      });
    });

    it('throws an error if there\'s an issue renewing', () => {
      const error = {
        name: 'AuthSdkError',
        message: 'OAuth flow response nonce doesn\'t match request nonce',
        errorCode: 'INTERNAL',
        errorSummary: 'OAuth flow response nonce doesn\'t match request nonce',
        errorLink: 'INTERNAL',
        errorId: 'INTERNAL',
        errorCauses: [],
        tokenKey: 'test-idToken'
      };

      return oauthUtil.setupFrame({
        willFail: true,
        authClient: client,
        tokenManagerAddKeys: {
          'test-idToken': tokens.standardIdTokenParsed
        },
        tokenManagerRenewArgs: ['test-idToken'],
        postMessageSrc: {
          baseUri: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          queryParams: {
            'client_id': 'NPSfOkH5eZrTy8PMDlvx',
            'redirect_uri': 'https://example.com/redirect',
            'response_type': 'id_token',
            'response_mode': 'okta_post_message',
            'state': oauthUtil.mockedState,
            'nonce': oauthUtil.mockedNonce,
            'scope': 'openid email',
            'prompt': 'none'
          }
        },
        postMessageResp: {
          'id_token': tokens.modifiedIdToken,
          state: oauthUtil.mockedState
        }
      })
      .catch(function(e) {
        util.expectErrorToEqual(e, error);
      });
    });

    it('removes expired token if an OAuthError is thrown while renewing', function() {
      return oauthUtil.setupFrame({
        authClient: client,
        willFail: true,
        time: tokens.standardAccessTokenParsed.expiresAt + 1,
        tokenManagerAddKeys: {
          'test-accessToken': tokens.standardAccessTokenParsed,
          'test-idToken': tokens.standardIdTokenParsed
        },
        tokenManagerRenewArgs: ['test-accessToken'],
        postMessageResp: {
          error: 'sampleErrorCode',
          'error_description': 'something went wrong',
          state: oauthUtil.mockedState
        }
      })
      .catch(function(e) {
        util.expectErrorToEqual(e, {
          name: 'OAuthError',
          message: 'something went wrong',
          errorCode: 'sampleErrorCode',
          errorSummary: 'something went wrong',
          tokenKey: 'test-accessToken',
        });
        oauthUtil.expectTokenStorageToEqual(localStorage, {
          'test-idToken': tokens.standardIdTokenParsed
        });
      });
    });
  });

  describe('autoRenew', () => {
    let tokenManagerAddKeys;
    let postMessageSrc;
    let postMessageResp;
    beforeEach(async function() {
      jest.spyOn(mocked.features, 'isLocalhost').mockReturnValue(true);
      tokenManagerAddKeys = {
        'test-accessToken': {
          accessToken: 'testInitialToken',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          expiresAt: 0,
          scopes: ['openid', 'email']
        }
      };
      postMessageSrc = {
        baseUri: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'token',
          'response_mode': 'okta_post_message',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'prompt': 'none'
        }
      };
      postMessageResp = {
        'access_token': tokens.standardAccessToken,
        'expires_in': 3600,
        'token_type': 'Bearer',
        'state': oauthUtil.mockedState
      };
      await setup({
        responseType: 'token',
        tokenManager: {
          autoRenew: true
        }
      });
    });

    it('removes expired token if an AuthSdkError is thrown while renewing', function() {
      return oauthUtil.setupFrame({
        authClient: client,
        willFail: true,
        time: tokens.standardAccessTokenParsed.expiresAt + 1,
        tokenManagerAddKeys: {
          'test-accessToken': tokens.standardAccessTokenParsed,
          'test-idToken': { 
            ...tokens.standardIdTokenParsed, 
            expiresAt: tokens.standardAccessTokenParsed.expiresAt + 10 
          }
        },
        tokenManagerRenewArgs: ['test-accessToken'],
        postMessageSrc: {
          baseUri: 'http://obviously.fake.foo',
        },
        postMessageResp: {
          state: oauthUtil.mockedState
        }
      })
      .catch(function(e) {
        util.expectErrorToEqual(e, {
          name: 'AuthSdkError',
          message: 'The request does not match client configuration',
          errorCode: 'INTERNAL',
          errorSummary: 'The request does not match client configuration',
          errorLink: 'INTERNAL',
          errorId: 'INTERNAL',
          errorCauses: [],
          tokenKey: 'test-accessToken'
        });
        oauthUtil.expectTokenStorageToEqual(localStorage, {
          'test-idToken': { 
            ...tokens.standardIdTokenParsed, 
            expiresAt: tokens.standardAccessTokenParsed.expiresAt + 10 
          }
        });
      });
    });

    it('automatically renews a token by default', function() {
      const expiresAt = tokens.standardAccessTokenParsed.expiresAt;
      return oauthUtil.setupFrame({
        authClient: client,
        autoRenew: true,
        fastForwardToTime: true,
        autoRenewTokenKey: 'test-accessToken',
        tokenTypesTobeRenewed: ['accessToken'],
        time: expiresAt + 1,
        tokenManagerAddKeys,
        postMessageSrc,
        postMessageResp
      })
      .then(function() {
        oauthUtil.expectTokenStorageToEqual(localStorage, {
          'test-accessToken': { 
            ...tokens.standardAccessTokenParsed, 
            expiresAt: expiresAt + 1 + 3600
          }
        });
      });
    });
  });

  describe('errors', () => {
    beforeEach(async () => {
      await setup({
        tokenManager: {
          autoRenew: true
        }
      });
    });

    it('Emits an "error" event on OAuth failure', function(done) {
      const error = {
        name: 'OAuthError',
        message: 'something went wrong',
        errorCode: 'sampleErrorCode',
        errorSummary: 'something went wrong',
        tokenKey: 'test-idToken'
      };
      var errorEventCallback = jest.fn().mockImplementation(function(err) {
        try {
          util.expectErrorToEqual(err, error);
        } catch (e) {
          done.fail(e as any);
        }
      });
      client.tokenManager.on('error', errorEventCallback);

      oauthUtil.setupFrame({
        authClient: client,
        autoRenew: true,
        willFail: true,
        fastForwardToTime: true,
        autoRenewTokenKey: 'test-idToken',
        time: tokens.standardIdTokenParsed.expiresAt + 1,
        tokenManagerAddKeys: {
          'test-idToken': tokens.standardIdTokenParsed
        },
        postMessageResp: {
          error: 'sampleErrorCode',
          'error_description': 'something went wrong',
          state: oauthUtil.mockedState
        }
      })
      .catch(function(err) {
        util.expectErrorToEqual(err, error);
        oauthUtil.expectTokenStorageToEqual(localStorage, {});
        expect(errorEventCallback).toHaveBeenCalled();
      })
      .then(function() {
        done();
      })
      .catch(function(err) {
        done.fail(err);
      });
    });

    it('Emits an "error" event on AuthSdkError', function(done) {
      var errorEventCallback = jest.fn().mockImplementation(function(err) {
        try {
          util.expectErrorToEqual(err, {
            name: 'AuthSdkError',
            message: 'The request does not match client configuration',
            errorCode: 'INTERNAL',
            errorSummary: 'The request does not match client configuration',
            errorLink: 'INTERNAL',
            errorId: 'INTERNAL',
            errorCauses: [],
            tokenKey: 'test-idToken'
          });
        } catch (e) {
          done.fail(e as AuthSdkError);
        }
      });
      client.tokenManager.on('error', errorEventCallback);

      oauthUtil.setupFrame({
        authClient: client,
        autoRenew: true,
        willFail: true,
        fastForwardToTime: true,
        autoRenewTokenKey: 'test-idToken',
        time: tokens.standardIdTokenParsed.expiresAt + 1,
        tokenManagerAddKeys: {
          'test-idToken': tokens.standardIdTokenParsed
        },
        postMessageSrc: {
          baseUri: 'http://obviously.fake.foo',
        },
        postMessageResp: {
          state: oauthUtil.mockedState
        }
      })
      .catch(function(err) {
        util.expectErrorToEqual(err, {
          name: 'AuthSdkError',
          message: 'The request does not match client configuration',
          errorCode: 'INTERNAL',
          errorSummary: 'The request does not match client configuration',
          errorLink: 'INTERNAL',
          errorId: 'INTERNAL',
          errorCauses: [],
          tokenKey: 'test-idToken'
        });
        oauthUtil.expectTokenStorageToEqual(localStorage, {});

        expect(errorEventCallback).toHaveBeenCalled();
      })
      .then(function() {
        done();
      })
      .catch(function(err) {
        done.fail(err);
      });
    });

    it('removes a token on OAuth failure', function() {
      return oauthUtil.setupFrame({
        authClient: client,
        autoRenew: true,
        willFail: true,
        fastForwardToTime: true,
        autoRenewTokenKey: 'test-idToken',
        time: tokens.standardIdTokenParsed.expiresAt + 1,
        tokenManagerAddKeys: {
          'test-idToken': tokens.standardIdTokenParsed
        },
        postMessageResp: {
          error: 'sampleErrorCode',
          'error_description': 'something went wrong',
          state: oauthUtil.mockedState
        }
      })
      .catch(function(err) {
        util.expectErrorToEqual(err, {
          name: 'OAuthError',
          message: 'something went wrong',
          errorCode: 'sampleErrorCode',
          errorSummary: 'something went wrong',
          tokenKey: 'test-idToken'
        });
        oauthUtil.expectTokenStorageToEqual(localStorage, {});
      });
    });

    it('removes a token on AuthSdkError', function() {
      return oauthUtil.setupFrame({
        authClient: client,
        autoRenew: true,
        willFail: true,
        fastForwardToTime: true,
        autoRenewTokenKey: 'test-idToken',
        time: tokens.standardIdTokenParsed.expiresAt + 1,
        tokenManagerAddKeys: {
          'test-idToken': tokens.standardIdTokenParsed
        },
        postMessageSrc: {
          baseUri: 'http://obviously.fake.foo',
        },
        postMessageResp: {
          state: oauthUtil.mockedState
        }
      })
      .catch(function(e) {
        util.expectErrorToEqual(e, {
          name: 'AuthSdkError',
          message: 'The request does not match client configuration',
          errorCode: 'INTERNAL',
          errorSummary: 'The request does not match client configuration',
          errorLink: 'INTERNAL',
          errorId: 'INTERNAL',
          errorCauses: [],
          tokenKey: 'test-idToken'
        });
        oauthUtil.expectTokenStorageToEqual(localStorage, {});
      });
    });
  });

  describe('localStorage', function() {

    beforeEach(async () => {
      await setup({
        tokenManager: {
          storage: 'localStorage'
        }
      });
    });

    describe('add', function() {
      it('adds a token', function() {
        client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
        oauthUtil.expectTokenStorageToEqual(localStorage, {
          'test-idToken': tokens.standardIdTokenParsed
        });
      });
    });

    describe('get', function() {
      it('returns a token', function() {
        localStorage.setItem('okta-token-storage', JSON.stringify({
          'test-idToken': tokens.standardIdTokenParsed
        }));
        util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
        return client.tokenManager.get('test-idToken')
        .then(function(token) {
          expect(token).toEqual(tokens.standardIdTokenParsed);
        });
      });
    });

    describe('remove', function() {
      it('removes a token', function() {
        localStorage.setItem('okta-token-storage', JSON.stringify({
          'test-idToken': tokens.standardIdTokenParsed,
          anotherKey: tokens.standardIdTokenParsed
        }));
        client.tokenManager.remove('test-idToken');
        oauthUtil.expectTokenStorageToEqual(localStorage, {
          anotherKey: tokens.standardIdTokenParsed
        });
      });
    });

    describe('clear', function() {
      it('clears all tokens', function() {
        localStorage.setItem('okta-token-storage', JSON.stringify({
          'test-idToken': tokens.standardIdTokenParsed,
          anotherKey: tokens.standardIdTokenParsed
        }));
        client.tokenManager.clear();
        oauthUtil.expectTokenStorageToEqual(localStorage, {});
      });
    });
  });

  describe('sessionStorage', function() {

    beforeEach(async () => {
      await setup({
        tokenManager: {
          storage: 'sessionStorage'
        }
      });
    });

    describe('add', function() {
      it('adds a token', function() {
        client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
        oauthUtil.expectTokenStorageToEqual(sessionStorage, {
          'test-idToken': tokens.standardIdTokenParsed
        });
      });
    });

    describe('get', function() {
      it('returns a token', function() {
        sessionStorage.setItem('okta-token-storage', JSON.stringify({
          'test-idToken': tokens.standardIdTokenParsed
        }));
        util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
        return client.tokenManager.get('test-idToken')
        .then(function(token) {
          expect(token).toEqual(tokens.standardIdTokenParsed);
        });
      });
    });

    describe('remove', function() {
      it('removes a token', function() {
        sessionStorage.setItem('okta-token-storage', JSON.stringify({
          'test-idToken': tokens.standardIdTokenParsed,
          anotherKey: tokens.standardIdTokenParsed
        }));
        client.tokenManager.remove('test-idToken');
        oauthUtil.expectTokenStorageToEqual(sessionStorage, {
          anotherKey: tokens.standardIdTokenParsed
        });
      });
    });

    describe('clear', function() {
      it('clears all tokens', function() {
        sessionStorage.setItem('okta-token-storage', JSON.stringify({
          'test-idToken': tokens.standardIdTokenParsed,
          anotherKey: tokens.standardIdTokenParsed
        }));
        client.tokenManager.clear();
        oauthUtil.expectTokenStorageToEqual(sessionStorage, {});
      });
    });
  });

  describe('cookie', function() {

    async function cookieStorageSetup() {
      await setup({
        tokenManager: {
          storage: 'cookie'
        }
      });
    }

    describe('add', function() {
      it('adds a token', async function() {
        await cookieStorageSetup();
        var setCookieMock = util.mockSetCookie();
        client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
        expect(setCookieMock).toHaveBeenCalledWith(
          'okta-token-storage_test-idToken',
          JSON.stringify(tokens.standardIdTokenParsed),
          '2200-01-01T00:00:00.000Z',
          secureCookieSettings
        );
      });

    });

    describe('get', function() {
      it('returns a token', async function() {
        const setCookieMock = util.mockSetCookie();
        const getCookieMock = util.mockGetCookie({
          'okta-token-storage_test-idToken': JSON.stringify(tokens.standardIdTokenParsed)
        });
        await cookieStorageSetup();
        util.warpToUnixTime(tokens.standardIdTokenClaims.iat); // token should not be expired
        return client.tokenManager.get('test-idToken')
        .then(function(token) {
          expect(token).toEqual(tokens.standardIdTokenParsed);
          expect(getCookieMock).toHaveBeenCalledWith();
          expect(setCookieMock).not.toHaveBeenCalled();
        });
      });

      it('returns undefined for an expired token', async function() {
        const setCookieMock = util.mockSetCookie();
        const getCookieMock = util.mockGetCookie(JSON.stringify({
          'test-idToken': tokens.standardIdTokenParsed
        }));
        await cookieStorageSetup();
        util.warpToUnixTime(tokens.standardIdTokenClaims.exp + 1); // token should be expired
        client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
        return client.tokenManager.get('test-idToken')
        .then(function(token) {
          expect(token).toBeUndefined();
          expect(getCookieMock).toHaveBeenCalledWith('okta-token-storage_test-idToken');
          expect(setCookieMock).toHaveBeenCalledWith(
            'okta-token-storage_test-idToken',
            JSON.stringify(tokens.standardIdTokenParsed),
            '2200-01-01T00:00:00.000Z', {
              secure: true,
              sameSite: 'none'
            }
          );
        });
      });
    });

    describe('remove', function() {
      it('removes a token', async function() {
        util.mockGetCookie({
          'okta-token-storage_test-idToken': JSON.stringify(tokens.standardIdTokenParsed),
          'okta-token-storage_anotherKey': JSON.stringify(tokens.standardIdTokenParsed)
        });
        util.mockSetCookie({
          'okta-token-storage_anotherKey': JSON.stringify(tokens.standardIdTokenParsed)
        });
        await cookieStorageSetup();
        const deleteCookieMock = util.mockDeleteCookie();
        client.tokenManager.remove('test-idToken');
        expect(deleteCookieMock).toHaveBeenCalledWith('okta-token-storage_test-idToken');
      });
    });

    describe('clear', function() {
      it('clears all tokens', async function() {
        util.mockGetCookie({
          'okta-token-storage_test-idToken': JSON.stringify(tokens.standardIdTokenParsed),
          'okta-token-storage_anotherKey': JSON.stringify(tokens.standardIdTokenParsed)
        });
        await cookieStorageSetup();
        const deleteCookieMock = util.mockDeleteCookie();
        client.tokenManager.clear();
        expect(deleteCookieMock).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('sessionCookie', function() {
    it('Uses a fixed date by default', async function() {
      await setup({
        tokenManager: {
          storage: 'cookie'
        }
      });
      var setCookieMock = util.mockSetCookie();
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      expect(setCookieMock).toHaveBeenCalledWith(
        'okta-token-storage_test-idToken',
        JSON.stringify(tokens.standardIdTokenParsed),
        '2200-01-01T00:00:00.000Z',
        secureCookieSettings
      );
    });

    it('Uses a session cookie when set', async function() {
      await setup({
        cookies: {
          sessionCookie: true
        },
        tokenManager: {
          storage: 'cookie',
        }
      });
      var setCookieMock = util.mockSetCookie();
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      expect(setCookieMock).toHaveBeenCalledWith(
        'okta-token-storage_test-idToken',
        JSON.stringify(tokens.standardIdTokenParsed),
        null,
        secureCookieSettings
      );
    });
  });
});
