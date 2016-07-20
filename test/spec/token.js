define(function(require) {
  var OktaAuth = require('OktaAuth');
  var tokens = require('../util/tokens');
  var oauthUtil = require('../util/oauthUtil');

  describe('token.decode', function () {

    function setupSync() {
      return new OktaAuth({ url: 'http://example.okta.com' });
    }

    it('correctly decodes a token', function () {
      var oa = setupSync();
      var decodedToken = oa.token.decode(tokens.unicodeToken);
      expect(decodedToken).toDeepEqual(tokens.unicodeDecoded);
    });

    it('throws an error for a malformed token', function () {
      var oa = setupSync();
      try {
        oa.token.decode('malformedToken');
        // Should never hit this
        expect(true).toBe(false);
      } catch (e) {
        expect(e.name).toEqual('AuthSdkError');
        expect(e.errorSummary).toBeDefined();
      }
    });
  });

  describe('token.getWithoutPrompt', function () {
    it('returns id_token using sessionToken', function (done) {
      return oauthUtil.setupFrame({
        oktaAuthArgs: {
          url: 'https://lboyette.trexcloud.com',
          clientId: 'NPSfOkH5eZrTy8PMDlvx',
          redirectUri: 'https://lboyette.trexcloud.com/redirect'
        },
        getWithoutPromptArgs: {
          sessionToken: 'testSessionToken'
        },
        postMessageSrc: {
          baseUri: 'https://lboyette.trexcloud.com/oauth2/v1/authorize',
          queryParams: {
            'client_id': 'NPSfOkH5eZrTy8PMDlvx',
            'redirect_uri': 'https://lboyette.trexcloud.com/redirect',
            'response_type': 'id_token',
            'response_mode': 'okta_post_message',
            'state': oauthUtil.mockedState,
            'nonce': oauthUtil.mockedNonce,
            'scope': 'openid email',
            'prompt': 'none',
            'sessionToken': 'testSessionToken'
          }
        }
      })
      .fin(function() {
        done();
      });
    });

    it('returns access_token using sessionToken', function (done) {
      return oauthUtil.setupFrame({
        oktaAuthArgs: {
          url: 'https://lboyette.trexcloud.com',
          clientId: 'NPSfOkH5eZrTy8PMDlvx',
          redirectUri: 'https://lboyette.trexcloud.com/redirect'
        },
        getWithoutPromptArgs: {
          responseType: 'token',
          sessionToken: 'testSessionToken'
        },
        postMessageSrc: {
          baseUri: 'https://lboyette.trexcloud.com/oauth2/v1/authorize',
          queryParams: {
            'client_id': 'NPSfOkH5eZrTy8PMDlvx',
            'redirect_uri': 'https://lboyette.trexcloud.com/redirect',
            'response_type': 'token',
            'response_mode': 'okta_post_message',
            'state': oauthUtil.mockedState,
            'nonce': oauthUtil.mockedNonce,
            'scope': 'openid email',
            'prompt': 'none',
            'sessionToken': 'testSessionToken'
          }
        },
        time: 1449699929,
        postMessageResp: {
          'access_token': tokens.standardAccessToken,
          'token_type': 'Bearer',
          'expires_in': 3600,
          'state': oauthUtil.mockedState
        },
        expectedResp: {
          accessToken: tokens.standardAccessToken,
          expiresAt: 1449703529,
          scopes: ['openid', 'email'],
          tokenType: 'Bearer'
        }
      })
      .fin(function() {
        done();
      });
    });

    it('returns id_token and access_token (in that order) using an array of responseTypes', function (done) {
      return oauthUtil.setupFrame({
        oktaAuthArgs: {
          url: 'https://lboyette.trexcloud.com',
          clientId: 'NPSfOkH5eZrTy8PMDlvx',
          redirectUri: 'https://lboyette.trexcloud.com/redirect'
        },
        getWithoutPromptArgs: {
          responseType: ['id_token', 'token'],
          sessionToken: 'testSessionToken'
        },
        postMessageSrc: {
          baseUri: 'https://lboyette.trexcloud.com/oauth2/v1/authorize',
          queryParams: {
            'client_id': 'NPSfOkH5eZrTy8PMDlvx',
            'redirect_uri': 'https://lboyette.trexcloud.com/redirect',
            'response_type': 'id_token token',
            'response_mode': 'okta_post_message',
            'state': oauthUtil.mockedState,
            'nonce': oauthUtil.mockedNonce,
            'scope': 'openid email',
            'prompt': 'none',
            'sessionToken': 'testSessionToken'
          }
        },
        time: 1449699929,
        postMessageResp: {
          'id_token': tokens.standardIdToken,
          'access_token': tokens.standardAccessToken,
          'token_type': 'Bearer',
          'expires_in': 3600,
          'state': oauthUtil.mockedState
        },
        expectedResp: [{
          idToken: tokens.standardIdToken,
          claims: tokens.standardIdTokenClaims,
          expiresAt: 1449699930,
          scopes: ['openid', 'email']
        }, {
          accessToken: tokens.standardAccessToken,
          expiresAt: 1449703529,
          scopes: ['openid', 'email'],
          tokenType: 'Bearer'
        }]
      })
      .fin(function() {
        done();
      });
    });

    it('returns access_token and id_token (in that order) using an array of responseTypes', function (done) {
      return oauthUtil.setupFrame({
        oktaAuthArgs: {
          url: 'https://lboyette.trexcloud.com',
          clientId: 'NPSfOkH5eZrTy8PMDlvx',
          redirectUri: 'https://lboyette.trexcloud.com/redirect'
        },
        getWithoutPromptArgs: {
          responseType: ['token', 'id_token'],
          sessionToken: 'testSessionToken'
        },
        postMessageSrc: {
          baseUri: 'https://lboyette.trexcloud.com/oauth2/v1/authorize',
          queryParams: {
            'client_id': 'NPSfOkH5eZrTy8PMDlvx',
            'redirect_uri': 'https://lboyette.trexcloud.com/redirect',
            'response_type': 'token id_token',
            'response_mode': 'okta_post_message',
            'state': oauthUtil.mockedState,
            'nonce': oauthUtil.mockedNonce,
            'scope': 'openid email',
            'prompt': 'none',
            'sessionToken': 'testSessionToken'
          }
        },
        time: 1449699929,
        postMessageResp: {
          'id_token': tokens.standardIdToken,
          'access_token': tokens.standardAccessToken,
          'token_type': 'Bearer',
          'expires_in': 3600,
          'state': oauthUtil.mockedState
        },
        expectedResp: [{
          accessToken: tokens.standardAccessToken,
          expiresAt: 1449703529,
          scopes: ['openid', 'email'],
          tokenType: 'Bearer'
        }, {
          idToken: tokens.standardIdToken,
          claims: tokens.standardIdTokenClaims,
          expiresAt: 1449699930,
          scopes: ['openid', 'email']
        }]
      })
      .fin(function() {
        done();
      });
    });

    it('returns a single token using an array with a single responseType', function (done) {
      return oauthUtil.setupFrame({
        oktaAuthArgs: {
          url: 'https://lboyette.trexcloud.com',
          clientId: 'NPSfOkH5eZrTy8PMDlvx',
          redirectUri: 'https://lboyette.trexcloud.com/redirect'
        },
        getWithoutPromptArgs: {
          responseType: ['id_token'],
          sessionToken: 'testSessionToken'
        },
        postMessageSrc: {
          baseUri: 'https://lboyette.trexcloud.com/oauth2/v1/authorize',
          queryParams: {
            'client_id': 'NPSfOkH5eZrTy8PMDlvx',
            'redirect_uri': 'https://lboyette.trexcloud.com/redirect',
            'response_type': 'id_token',
            'response_mode': 'okta_post_message',
            'state': oauthUtil.mockedState,
            'nonce': oauthUtil.mockedNonce,
            'scope': 'openid email',
            'prompt': 'none',
            'sessionToken': 'testSessionToken'
          }
        },
        expectedResp: [{
          idToken: tokens.standardIdToken,
          claims: tokens.standardIdTokenClaims,
          expiresAt: 1449699930,
          scopes: ['openid', 'email']
        }]
      })
      .fin(function() {
        done();
      });
    });

    oauthUtil.itErrorsCorrectly('throws an error if multiple responseTypes are sent as a string',
      {
        oktaAuthArgs: {
          url: 'https://lboyette.trexcloud.com',
          clientId: 'NPSfOkH5eZrTy8PMDlvx',
          redirectUri: 'https://lboyette.trexcloud.com/redirect'
        },
        getWithoutPromptArgs: {
          responseType: 'id_token token',
          sessionToken: 'testSessionToken'
        }
      },
      {
        name: 'AuthSdkError',
        message: 'Multiple OAuth responseTypes must be defined as an array',
        errorCode: 'INTERNAL',
        errorSummary: 'Multiple OAuth responseTypes must be defined as an array',
        errorLink: 'INTERNAL',
        errorId: 'INTERNAL',
        errorCauses: []
      }
    );
  });
});
