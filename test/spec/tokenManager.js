var OktaAuth = require('OktaAuth');
var tokens = require('../util/tokens');
var util = require('../util/util');
var oauthUtil = require('../util/oauthUtil');

function setupSync(options) {
  options = options || { tokenManager: {} };
  return new OktaAuth({
    issuer: 'https://auth-js-test.okta.com',
    clientId: 'NPSfOkH5eZrTy8PMDlvx',
    redirectUri: 'https://example.com/redirect',
    maxClockSkew: options.maxClockSkew || 1, // set default to 1 second
    tokenManager: {
      storage: options.tokenManager.type,
      autoRenew: options.tokenManager.autoRenew || false
    }
  });
}

beforeEach(function() {
  localStorage.clear();
  sessionStorage.clear();
});

describe('TokenManager', function() {
  describe('general', function() {
    it('defaults to localStorage', function() {
      var client = setupSync();
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      oauthUtil.expectTokenStorageToEqual(localStorage, {
        'test-idToken': tokens.standardIdTokenParsed
      });
    });
    it('defaults to sessionStorage if localStorage isn\'t available', function() {
      jest.spyOn(window.console, 'log');
      oauthUtil.mockLocalStorageError();
      var client = setupSync();
      expect(window.console.log).toHaveBeenCalledWith(
        '[okta-auth-sdk] WARN: This browser doesn\'t ' +
        'support localStorage. Switching to sessionStorage.'
      );
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      oauthUtil.expectTokenStorageToEqual(sessionStorage, {
        'test-idToken': tokens.standardIdTokenParsed
      });
    });
    it('defaults to sessionStorage if localStorage cannot be written to', function() {
      jest.spyOn(window.console, 'log');
      oauthUtil.mockStorageSetItemError();
      var client = setupSync();
      expect(window.console.log).toHaveBeenCalledWith(
        '[okta-auth-sdk] WARN: This browser doesn\'t ' +
        'support localStorage. Switching to sessionStorage.'
      );
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      oauthUtil.expectTokenStorageToEqual(sessionStorage, {
        'test-idToken': tokens.standardIdTokenParsed
      });
    });
    it('defaults to cookie-based storage if localStorage and sessionStorage are not available', function() {
      jest.spyOn(window.console, 'log');
      oauthUtil.mockLocalStorageError();
      oauthUtil.mockSessionStorageError();
      var client = setupSync();
      expect(window.console.log).toHaveBeenCalledWith(
        '[okta-auth-sdk] WARN: This browser doesn\'t ' +
        'support sessionStorage. Switching to cookie-based storage.'
      );
      var setCookieMock = util.mockSetCookie();
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      expect(setCookieMock).toHaveBeenCalledWith(
        'okta-token-storage',
        JSON.stringify({'test-idToken': tokens.standardIdTokenParsed}),
        '2038-01-19T03:14:07.000Z'
      );
    });
    it('defaults to cookie-based storage if sessionStorage cannot be written to', function() {
      jest.spyOn(window.console, 'log');
      oauthUtil.mockLocalStorageError();
      oauthUtil.mockStorageSetItemError();
      var client = setupSync({
        tokenManager: {
          storage: 'sessionStorage'
        }
      });
      expect(window.console.log).toHaveBeenCalledWith(
        '[okta-auth-sdk] WARN: This browser doesn\'t ' +
        'support sessionStorage. Switching to cookie-based storage.'
      );
      var setCookieMock = util.mockSetCookie();
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      expect(setCookieMock).toHaveBeenCalledWith(
        'okta-token-storage',
        JSON.stringify({'test-idToken': tokens.standardIdTokenParsed}),
        '2038-01-19T03:14:07.000Z'
      );
    });
  });

  describe('add', function() {
    it('throws an error when attempting to add a non-token', function() {
      var client = setupSync();
      try {
        client.tokenManager.add('test-idToken', [
          tokens.standardIdTokenParsed,
          tokens.standardIdTokenParsed
        ]);

        // Should never hit this
        expect(true).toEqual(false);
      } catch (e) {
        util.expectErrorToEqual(e, {
          name: 'AuthSdkError',
          message: 'Token must be an Object with scopes, expiresAt, and an idToken or accessToken properties',
          errorCode: 'INTERNAL',
          errorSummary: 'Token must be an Object with scopes, expiresAt, and an idToken or accessToken properties',
          errorLink: 'INTERNAL',
          errorId: 'INTERNAL',
          errorCauses: []
        });
      }
    });
  });

  describe('renew', function() {
    it('allows renewing an idToken', function(done) {
      return oauthUtil.setupFrame({
        authClient: setupSync(),
        tokenManagerAddKeys: {
          'test-idToken': {
            idToken: 'testInitialToken',
            claims: {'fake': 'claims'},
            expiresAt: 0,
            scopes: ['openid', 'email']
          }
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
          'id_token': tokens.standardIdToken,
          state: oauthUtil.mockedState
        },
        expectedResp: tokens.standardIdTokenParsed
      })
      .then(function() {
        oauthUtil.expectTokenStorageToEqual(localStorage, {
          'test-idToken': tokens.standardIdTokenParsed
        });
      })
      .fin(done);
    });

    it('allows renewing an accessToken', function(done) {
      return oauthUtil.setupFrame({
        authClient: setupSync(),
        tokenManagerAddKeys: {
          'test-accessToken': {
            accessToken: 'testInitialToken',
            expiresAt: 1449703529,
            scopes: ['openid', 'email'],
            tokenType: 'Bearer'
          }
        },
        tokenManagerRenewArgs: ['test-accessToken'],
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
          'token_type': 'Bearer',
          'expires_in': 3600,
          'state': oauthUtil.mockedState
        },
        expectedResp: tokens.standardAccessTokenParsed
      })
      .then(function() {
        oauthUtil.expectTokenStorageToEqual(localStorage, {
          'test-accessToken': tokens.standardAccessTokenParsed
        });
      })
      .fin(done);
    });

    oauthUtil.itpErrorsCorrectly('throws an errors when a token doesn\'t exist',
      {
        authClient: setupSync(),
        tokenManagerRenewArgs: ['test-accessToken']
      },
      {
        name: 'AuthSdkError',
        message: 'The tokenManager has no token for the key: test-accessToken',
        errorCode: 'INTERNAL',
        errorSummary: 'The tokenManager has no token for the key: test-accessToken',
        errorLink: 'INTERNAL',
        errorId: 'INTERNAL',
        errorCauses: []
      }
    );

    it('throws an errors when the token is mangled', function(done) {
      localStorage.setItem('okta-token-storage', '#unparseableJson#');
      return oauthUtil.setupFrame({
        authClient: setupSync(),
        willFail: true,
        tokenManagerRenewArgs: ['test-accessToken']
      })
      .then(function() {
        expect(true).toEqual(false);
      })
      .fail(function(err) {
        util.expectErrorToEqual(err, {
          name: 'AuthSdkError',
          message: 'Unable to parse storage string: okta-token-storage',
          errorCode: 'INTERNAL',
          errorSummary: 'Unable to parse storage string: okta-token-storage',
          errorLink: 'INTERNAL',
          errorId: 'INTERNAL',
          errorCauses: []
        });
      })
      .fin(done);
    });

    oauthUtil.itpErrorsCorrectly('throws an error if there\'s an issue renewing',
      {
        authClient: setupSync(),
        tokenManagerAddKeys: {
          'test-idToken': tokens.standardIdTokenParsed
        },
        tokenManagerRenewArgs: ['test-idToken'],
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
          'id_token': tokens.modifiedIdToken,
          state: oauthUtil.mockedState
        }
      },
      {
        name: 'AuthSdkError',
        message: 'OAuth flow response nonce doesn\'t match request nonce',
        errorCode: 'INTERNAL',
        errorSummary: 'OAuth flow response nonce doesn\'t match request nonce',
        errorLink: 'INTERNAL',
        errorId: 'INTERNAL',
        errorCauses: []
      }
    );

    it('removes token if an OAuthError is thrown while renewing', function(done) {
      return oauthUtil.setupFrame({
        authClient: setupSync(),
        willFail: true,
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
      .fail(function(e) {
        util.expectErrorToEqual(e, {
          name: 'OAuthError',
          message: 'something went wrong',
          errorCode: 'sampleErrorCode',
          errorSummary: 'something went wrong'
        });
        oauthUtil.expectTokenStorageToEqual(localStorage, {
          'test-idToken': tokens.standardIdTokenParsed
        });
      })
      .fin(done);
    });
  });

  describe('autoRenew', function() {
    beforeEach(function() {
      jest.useFakeTimers();
    });

    it('automatically renews a token by default', function(done) {
      var expiresAt = tokens.standardIdTokenParsed.expiresAt;
      return oauthUtil.setupFrame({
        authClient: setupSync({
          tokenManager: {
            autoRenew: true
          }
        }),
        autoRenew: true,
        fastForwardToTime: true,
        autoRenewTokenKey: 'test-idToken',
        time: expiresAt + 1,
        tokenManagerAddKeys: {
          'test-idToken': {
            idToken: 'testInitialToken',
            claims: {'fake': 'claims'},
            expiresAt: expiresAt,
            scopes: ['openid', 'email']
          }
        },
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
          'id_token': tokens.standardIdToken,
          state: oauthUtil.mockedState
        }
      })
      .then(function() {
        oauthUtil.expectTokenStorageToEqual(localStorage, {
          'test-idToken': tokens.standardIdTokenParsed
        });
      })
      .fin(done);
    });

    it('automatically renews a token early when clock skew is considered', function(done) {
      var expiresAt = tokens.standardIdTokenParsed.expiresAt;
      return oauthUtil.setupFrame({
        authClient: setupSync({
          // Account for 10 min of clock skew
          maxClockSkew: 600,
          tokenManager: {
            autoRenew: true
          }
        }),
        autoRenew: true,
        fastForwardToTime: true,
        autoRenewTokenKey: 'test-idToken',
        time: expiresAt - 10,
        tokenManagerAddKeys: {
          'test-idToken': {
            idToken: 'testInitialToken',
            claims: {'fake': 'claims'},
            expiresAt: expiresAt,
            scopes: ['openid', 'email']
          }
        },
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
          'id_token': tokens.standardIdToken,
          state: oauthUtil.mockedState
        }
      })
      .then(function() {
        oauthUtil.expectTokenStorageToEqual(localStorage, {
          'test-idToken': tokens.standardIdTokenParsed
        });
      })
      .fin(done);
    });

    it('does not return the token after tokens were cleared before renew promise was resolved', function(done) {
      var expiresAt = tokens.standardIdTokenParsed.expiresAt;
      return oauthUtil.setupFrame({
        authClient: setupSync({
          tokenManager: {
            autoRenew: true
          }
        }),
        autoRenew: true,
        fastForwardToTime: true,
        autoRenewTokenKey: 'test-idToken',
        time: expiresAt + 1,
        tokenManagerAddKeys: {
          'test-idToken': {
            idToken: 'testInitialToken',
            claims: {'fake': 'claims'},
            expiresAt: expiresAt,
            scopes: ['openid', 'email']
          }
        },
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
          'id_token': tokens.standardIdToken,
          state: oauthUtil.mockedState
        },
        beforeCompletion: function(authClient) {
          // Simulate tokens being cleared while the renew request is performed
          authClient.tokenManager.clear();
        }
      })
      .then(function() {
        oauthUtil.expectTokenStorageToEqual(localStorage, {});
      })
      .fin(done);
    });

    it('removes a token on OAuth failure', function(done) {
      return oauthUtil.setupFrame({
        authClient: setupSync({
          tokenManager: {
            autoRenew: true
          }
        }),
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
      .fail(function(err) {
        util.expectErrorToEqual(err, {
          name: 'OAuthError',
          message: 'something went wrong',
          errorCode: 'sampleErrorCode',
          errorSummary: 'something went wrong'
        });
        oauthUtil.expectTokenStorageToEqual(localStorage, {});
      })
      .fin(done);
    });

    it('does not renew the token if the token has not expired', function() {
      var CLOCK_SKEW = 600;
      var CURRENT_TIME = 0;
      var EXPIRATION_TIME = CURRENT_TIME + CLOCK_SKEW + 10;
      util.warpToUnixTime(CURRENT_TIME);
      var TokenManager = require('../../lib/TokenManager');
      var sdk = {
        token: {
          renew: jest.fn(),
        },
        options: {
          maxClockSkew: CLOCK_SKEW
        }
      };
      var tokenManager = new TokenManager(sdk);
      var expiresAt = EXPIRATION_TIME;
      var token = {
        accessToken: 'fakeToken',
        expiresAt: expiresAt,
        scopes: []
      };
      tokenManager.add('accessToken', token);
      tokenManager.get('accessToken');
      expect(sdk.token.renew).not.toHaveBeenCalled();
      util.warpToUnixTime(EXPIRATION_TIME + 10);
      tokenManager.get('accessToken');
      expect(sdk.token.renew).toHaveBeenCalled();
    });

    it('emits "expired" on existing tokens even when autoRenew is disabled', function(done) {
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      localStorage.setItem('okta-token-storage', JSON.stringify({
        'test-idToken': tokens.standardIdTokenParsed
      }));
      var client = setupSync({ tokenManager: { autoRenew: false } });
      client.tokenManager.on('expired', function(key, token) {
        expect(key).toEqual('test-idToken');
        expect(token).toEqual(tokens.standardIdTokenParsed);
        done();
      });
      util.warpByTicksToUnixTime(tokens.standardIdTokenParsed.expiresAt + 1);
    });

    it('emits "expired" on new tokens even when autoRenew is disabled', function(done) {
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      var client = setupSync({ tokenManager: { autoRenew: false } });
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      client.tokenManager.on('expired', function(key, token) {
        expect(key).toEqual('test-idToken');
        expect(token).toEqual(tokens.standardIdTokenParsed);
        done();
      });
      util.warpByTicksToUnixTime(tokens.standardIdTokenParsed.expiresAt + 1);
    });

    it('returns undefined for a token that has expired when autoRenew is disabled', function(done) {
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      localStorage.setItem('okta-token-storage', JSON.stringify({
        'test-idToken': tokens.standardIdTokenParsed
      }));
      var client = setupSync({ tokenManager: { autoRenew: false } });
      util.warpToUnixTime(tokens.standardIdTokenParsed.expiresAt + 1);
      client.tokenManager.get('test-idToken')
      .then(function(token) {
        expect(token).toBeUndefined();
        done();
      });
    });

    it('returns undefined for an active token when autoRenew is disabled, accounting' +
        'for clock skew', function(done) {
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      localStorage.setItem('okta-token-storage', JSON.stringify({
        'test-idToken': tokens.standardIdTokenParsed
      }));
      var client = setupSync({
        // Account for 10 min of clock skew
        maxClockSkew: 600,
        tokenManager: {
          autoRenew: false
        }
      });
      util.warpToUnixTime(tokens.standardIdTokenParsed.expiresAt - 5);
      client.tokenManager.get('test-idToken')
      .then(function(token) {
        expect(token).toBeUndefined();
        done();
      });
    });
  });

  describe('localStorage', function() {

    function localStorageSetup() {
      return setupSync({
        tokenManager: {
          type: 'localStorage'
        }
      });
    }

    describe('add', function() {
      it('adds a token', function() {
        var client = localStorageSetup();
        client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
        oauthUtil.expectTokenStorageToEqual(localStorage, {
          'test-idToken': tokens.standardIdTokenParsed
        });
      });
    });

    describe('get', function() {
      it('returns a token', function(done) {
        var client = localStorageSetup();
        localStorage.setItem('okta-token-storage', JSON.stringify({
          'test-idToken': tokens.standardIdTokenParsed
        }));
        util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
        client.tokenManager.get('test-idToken')
        .then(function(token) {
          expect(token).toEqual(tokens.standardIdTokenParsed);
          done();
        });
        // Warp back to current time
        util.warpToUnixTime(Date.now());
      });

      it('returns undefined for an expired token', function(done) {
        var client = localStorageSetup();
        localStorage.setItem('okta-token-storage', JSON.stringify({
          'test-idToken': tokens.standardIdTokenParsed
        }));
        client.tokenManager.get('test-idToken')
        .then(function(token) {
          expect(token).toBeUndefined();
          done();
        });
      });
    });

    describe('remove', function() {
      it('removes a token', function() {
        var client = localStorageSetup();
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
        var client = localStorageSetup();
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

    function sessionStorageSetup() {
      return setupSync({
        tokenManager: {
          type: 'sessionStorage'
        }
      });
    }

    describe('add', function() {
      it('adds a token', function() {
        var client = sessionStorageSetup();
        client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
        oauthUtil.expectTokenStorageToEqual(sessionStorage, {
          'test-idToken': tokens.standardIdTokenParsed
        });
      });
    });

    describe('get', function() {
      it('returns a token', function(done) {
        var client = sessionStorageSetup();
        sessionStorage.setItem('okta-token-storage', JSON.stringify({
          'test-idToken': tokens.standardIdTokenParsed
        }));
        util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
        client.tokenManager.get('test-idToken')
        .then(function(token) {
          expect(token).toEqual(tokens.standardIdTokenParsed);
          done();
        });
        // Warp back to current time
        util.warpToUnixTime(Date.now());
      });

      it('returns undefined for an expired token', function(done) {
        var client = sessionStorageSetup();
        sessionStorage.setItem('okta-token-storage', JSON.stringify({
          'test-idToken': tokens.standardIdTokenParsed
        }));
        client.tokenManager.get('test-idToken')
        .then(function(token) {
          expect(token).toBeUndefined();
          done();
        });
      });
    });

    describe('remove', function() {
      it('removes a token', function() {
        var client = sessionStorageSetup();
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
        var client = sessionStorageSetup();
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
      return setupSync({
        tokenManager: {
          type: 'cookie'
        }
      });
    }

    describe('add', function() {
      it('adds a token', function() {
        var client = cookieStorageSetup();
        var setCookieMock = util.mockSetCookie();
        client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
        expect(setCookieMock).toHaveBeenCalledWith(
          'okta-token-storage',
          JSON.stringify({'test-idToken': tokens.standardIdTokenParsed}),
          '2038-01-19T03:14:07.000Z'
        );
      });
    });

    describe('get', function() {
      it('returns a token', function(done) {
        var client = cookieStorageSetup();
        client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
        util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
        client.tokenManager.get('test-idToken')
        .then(function(token) {
          expect(token).toEqual(tokens.standardIdTokenParsed);
          done();
        });
        // Warp back to current time
        util.warpToUnixTime(Date.now());
      });

      it('returns undefined for an expired token', function(done) {
        var client = cookieStorageSetup();
        client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
        client.tokenManager.get('test-idToken')
        .then(function(token) {
          expect(token).toBeUndefined();
          done();
        });
      });
    });

    describe('remove', function() {
      it('removes a token', function() {
        var client = cookieStorageSetup();
        client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
        client.tokenManager.add('anotherKey', tokens.standardIdTokenParsed);
        var setCookieMock = util.mockSetCookie();
        client.tokenManager.remove('test-idToken');
        expect(setCookieMock).toHaveBeenCalledWith(
          'okta-token-storage',
          JSON.stringify({anotherKey: tokens.standardIdTokenParsed}),
          '2038-01-19T03:14:07.000Z'
        );
      });
    });

    describe('clear', function() {
      it('clears all tokens', function() {
        var client = cookieStorageSetup();
        client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
        client.tokenManager.add('anotherKey', tokens.standardIdTokenParsed);
        var setCookieMock = util.mockSetCookie();
        client.tokenManager.clear();
        expect(setCookieMock).toHaveBeenCalledWith(
          'okta-token-storage',
          '{}',
          '2038-01-19T03:14:07.000Z'
        );
      });
    });
  });
});
