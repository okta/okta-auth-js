/* eslint-disable max-statements */
/* global window, localStorage, sessionStorage */

const mocked = {
  features: {
    isHTTPS: () => true,
    isBrowser: () => typeof window !== 'undefined',
    isIE11OrLess: () => false,
    isLocalhost: () => false,
    isTokenVerifySupported: () => true
  }
};
jest.mock('../../../lib/features', () => {
  return mocked.features;
});

import { OktaAuth } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import util from '@okta/test.support/util';
import oauthUtil from '@okta/test.support/oauthUtil';
import SdkClock from '../../../lib/clock';
import { TokenManager } from '../../../lib/TokenManager';
  
describe('TokenManager (browser)', function() {
  let client;

  // Expected settings on HTTPS
  const secureCookieSettings = {
    secure: true,
    sameSite: 'none'
  };

  function createAuth(options) {
    options = options || {};
    options.tokenManager = options.tokenManager || {};
    jest.spyOn(SdkClock, 'create').mockReturnValue(new SdkClock(options.localClockOffset));
    return new OktaAuth({
      pkce: false,
      issuer: 'https://auth-js-test.okta.com',
      clientId: 'NPSfOkH5eZrTy8PMDlvx',
      redirectUri: 'https://example.com/redirect',
      storageUtil: options.storageUtil,
      tokenManager: {
        expireEarlySeconds: options.tokenManager.expireEarlySeconds || 0,
        storage: options.tokenManager.storage,
        storageKey: options.tokenManager.storageKey,
        autoRenew: options.tokenManager.autoRenew || false,
        autoRemove: options.tokenManager.autoRemove || false,
        secure: options.tokenManager.secure // used by cookie storage
      }
    });
  }

  function setupSync(options = {}) {
    client = createAuth(options);
    // clear downstream listeners
    client.tokenManager.off('added');
    client.tokenManager.off('removed');
    return client;
  }
  
  beforeEach(function() {
    client = null;
    localStorage.clear();
    sessionStorage.clear();
  });
  
  describe('options', () => {
    it('defaults to localStorage', function() {
      setupSync();
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      oauthUtil.expectTokenStorageToEqual(localStorage, {
        'test-idToken': tokens.standardIdTokenParsed
      });
    });
    it('defaults to sessionStorage if localStorage isn\'t available', function() {
      const console = util.getConsole();
      jest.spyOn(console, 'warn');
      oauthUtil.mockLocalStorageError();
      setupSync();
      expect(console.warn).toHaveBeenCalledWith(
        '[okta-auth-sdk] WARN: This browser doesn\'t ' +
        'support localStorage. Switching to sessionStorage.'
      );
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      oauthUtil.expectTokenStorageToEqual(sessionStorage, {
        'test-idToken': tokens.standardIdTokenParsed
      });
    });
    it('defaults to sessionStorage if localStorage cannot be written to', function() {
      const console = util.getConsole();
      jest.spyOn(console, 'warn');
      oauthUtil.mockStorageSetItemError();
      setupSync();
      expect(console.warn).toHaveBeenCalledWith(
        '[okta-auth-sdk] WARN: This browser doesn\'t ' +
        'support localStorage. Switching to sessionStorage.'
      );
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      oauthUtil.expectTokenStorageToEqual(sessionStorage, {
        'test-idToken': tokens.standardIdTokenParsed
      });
    });
    it('defaults to cookie-based storage if localStorage and sessionStorage are not available', function() {
      const console = util.getConsole();
      jest.spyOn(console, 'warn');
      oauthUtil.mockLocalStorageError();
      oauthUtil.mockSessionStorageError();
      setupSync();
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
    it('defaults to cookie-based storage if sessionStorage cannot be written to', function() {
      const console = util.getConsole();
      jest.spyOn(console, 'warn');
      oauthUtil.mockLocalStorageError();
      oauthUtil.mockStorageSetItemError();
      setupSync({
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
        '2200-01-01T00:00:00.000Z',
        secureCookieSettings
      );
    });
    it('should be locked with default expireEarlySeconds for non-dev env', () => {
      jest.spyOn(mocked.features, 'isLocalhost').mockReturnValue(false);
      setupSync();
      const options = {
        expireEarlySeconds: 60
      };
      const instance = new TokenManager(client, options);
      expect(instance._getOptions().expireEarlySeconds).toBe(30);
    });
    it('should be able to set expireEarlySeconds for dev env', () => {
      jest.spyOn(mocked.features, 'isLocalhost').mockReturnValue(true);
      setupSync();
      const options = {
        expireEarlySeconds: 60
      };
      const instance = new TokenManager(client, options);
      expect(instance._getOptions().expireEarlySeconds).toBe(60);
    });
  });

  describe('renew', () => {
    beforeEach(() => {
      jest.spyOn(mocked.features, 'isLocalhost').mockReturnValue(true);
      setupSync();
    });

    it('allows renewing an idToken, without renewing accessToken', function() {
      const testInitialIdToken = {
        idToken: 'testInitialToken',
        claims: {'fake': 'claims'},
        expiresAt: 0,
        scopes: ['openid', 'email']
      };
      const testInitialAccessToken = {
        accessToken: 'testInitialToken',
        expiresAt: 0,
        scopes: ['openid', 'email']
      };
      return oauthUtil.setupFrame({
        authClient: client,
        tokenManagerAddKeys: {
          'test-idToken': testInitialIdToken,
          'test-accessToken': testInitialAccessToken
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
        time: 1449699929,
        postMessageResp: {
          'id_token': tokens.standardIdToken,
          'expires_in': 3600,
          'token_type': 'Bearer',
          'state': oauthUtil.mockedState
        },
        expectedResp: tokens.standardIdTokenParsed
      })
      .then(function() {
        oauthUtil.expectTokenStorageToEqual(localStorage, {
          'test-idToken': tokens.standardIdTokenParsed,
          'test-accessToken': testInitialAccessToken
        });
      });
    });

    it('allows renewing an accessToken, without renewing idToken', function() {
      var expiresAt = tokens.standardAccessTokenParsed.expiresAt;
      var mockTime = expiresAt - 3600;
      const testInitialIdToken = {
        idToken: 'testInitialToken',
        claims: {'fake': 'claims'},
        expiresAt: 0,
        scopes: ['openid', 'email']
      };
      const testInitialAccessToken = {
        accessToken: 'testInitialToken',
        expiresAt: 0,
        scopes: ['openid', 'email']
      };

      return oauthUtil.setupFrame({
        authClient: client,
        tokenManagerAddKeys: {
          'idToken': testInitialIdToken,
          'accessToken': testInitialAccessToken
        },
        time: mockTime,
        tokenManagerRenewArgs: ['accessToken'],
        postMessageSrc: {
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
        },
        postMessageResp: {
          'access_token': tokens.standardAccessToken,
          'expires_in': 3600,
          'token_type': 'Bearer',
          'state': oauthUtil.mockedState
        },
        expectedResp: tokens.standardAccessTokenParsed
      })
      .then(function() {
        oauthUtil.expectTokenStorageToEqual(localStorage, {
          'idToken': testInitialIdToken,
          'accessToken': tokens.standardAccessTokenParsed
        });
      });
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
    beforeEach(function() {
      jest.spyOn(mocked.features, 'isLocalhost').mockReturnValue(true);
      tokenManagerAddKeys = {
        'test-accessToken': {
          accessToken: 'testInitialToken',
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
      setupSync({
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
        tokenTypesTobeRenewed: ['access_token'],
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

    it('automatically renews a token early when local clock offset is considered', function() {
      var expiresAt = tokens.standardAccessTokenParsed.expiresAt;
      return oauthUtil.setupFrame({
        authClient: setupSync({
          // local clock offset: 10 seconds behind the server
          localClockOffset: 10000,
          tokenManager: {
            autoRenew: true
          }
        }),
        autoRenew: true,
        fastForwardToTime: true,
        autoRenewTokenKey: 'test-accessToken',
        tokenTypesTobeRenewed: ['access_token'],
        time: expiresAt - 10, // set local time to 10 seconds until expiration
        tokenManagerAddKeys,
        postMessageSrc,
        postMessageResp
      })
      .then(() => {
        oauthUtil.expectTokenStorageToEqual(localStorage, {
          'test-accessToken': { 
            ...tokens.standardAccessTokenParsed, 
            expiresAt: expiresAt - 10 + 3600
          }
        });
      });
    });

    it('renews a token early when "expireEarlySeconds" option is considered', function() {
      var expiresAt = tokens.standardAccessTokenParsed.expiresAt;
      return oauthUtil.setupFrame({
        authClient: setupSync({
          tokenManager: {
            autoRenew: true,
            expireEarlySeconds: 10
          }
        }),
        autoRenew: true,
        fastForwardToTime: true,
        autoRenewTokenKey: 'test-accessToken',
        tokenTypesTobeRenewed: ['access_token'],
        time: expiresAt - 10, // set local time to 10 seconds until expiration
        tokenManagerAddKeys,
        postMessageSrc,
        postMessageResp
      })
      .then(function() {
        oauthUtil.expectTokenStorageToEqual(localStorage, {
          'test-accessToken': { 
            ...tokens.standardAccessTokenParsed, 
            expiresAt: expiresAt - 10 + 3600
          }
        });
      });
    });

    it('does not return the token after tokens were cleared before renew promise was resolved', function() {
      var expiresAt = tokens.standardAccessTokenParsed.expiresAt;
      return oauthUtil.setupFrame({
        authClient: client,
        autoRenew: true,
        fastForwardToTime: true,
        autoRenewTokenKey: 'test-accessToken',
        tokenTypesTobeRenewed: ['access_token'],
        time: expiresAt + 1,
        tokenManagerAddKeys,
        postMessageSrc,
        postMessageResp,
        beforeCompletion: function(authClient) {
          // Simulate tokens being cleared while the renew request is performed
          authClient.tokenManager.clear();
        }
      })
      .then(function() {
        oauthUtil.expectTokenStorageToEqual(localStorage, {});
      });
    });
  });

  describe('errors', () => {
    beforeEach(() => {
      setupSync({
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
          done.fail(e);
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
          done.fail(e);
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

    beforeEach(() => {
      setupSync({
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

    beforeEach(() => {
      setupSync({
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

    function cookieStorageSetup() {
      setupSync({
        tokenManager: {
          storage: 'cookie'
        }
      });
    }

    describe('add', function() {
      it('adds a token', function() {
        cookieStorageSetup();
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
      it('returns a token', function() {
        const setCookieMock = util.mockSetCookie();
        const getCookieMock = util.mockGetCookie({
          'okta-token-storage_test-idToken': JSON.stringify(tokens.standardIdTokenParsed)
        });
        cookieStorageSetup();
        util.warpToUnixTime(tokens.standardIdTokenClaims.iat); // token should not be expired
        return client.tokenManager.get('test-idToken')
        .then(function(token) {
          expect(token).toEqual(tokens.standardIdTokenParsed);
          expect(getCookieMock).toHaveBeenCalledWith();
          expect(setCookieMock).not.toHaveBeenCalled();
        });
      });

      it('returns undefined for an expired token', function() {
        const setCookieMock = util.mockSetCookie();
        const getCookieMock = util.mockGetCookie(JSON.stringify({
          'test-idToken': tokens.standardIdTokenParsed
        }));
        cookieStorageSetup();
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
      it('removes a token', function() {
        util.mockGetCookie({
          'okta-token-storage_test-idToken': JSON.stringify(tokens.standardIdTokenParsed),
          'okta-token-storage_anotherKey': JSON.stringify(tokens.standardIdTokenParsed)
        });
        util.mockSetCookie({
          'okta-token-storage_anotherKey': JSON.stringify(tokens.standardIdTokenParsed)
        });
        cookieStorageSetup();
        const deleteCookieMock = util.mockDeleteCookie();
        client.tokenManager.remove('test-idToken');
        expect(deleteCookieMock).toHaveBeenCalledWith('okta-token-storage_test-idToken');
      });
    });

    describe('clear', function() {
      it('clears all tokens', function() {
        util.mockGetCookie({
          'okta-token-storage_test-idToken': JSON.stringify(tokens.standardIdTokenParsed),
          'okta-token-storage_anotherKey': JSON.stringify(tokens.standardIdTokenParsed)
        });
        cookieStorageSetup();
        const deleteCookieMock = util.mockDeleteCookie();
        client.tokenManager.clear();
        expect(deleteCookieMock).toHaveBeenCalledTimes(2);
      });
    });
  });
});
