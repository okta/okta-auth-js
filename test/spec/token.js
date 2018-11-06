var OktaAuth = require('OktaAuth');
var tokens = require('../util/tokens');
var util = require('../util/util');
var oauthUtil = require('../util/oauthUtil');
var packageJson = require('../../package.json');
var _ = require('lodash');
var Q = require('q');

function setupSync() {
  return new OktaAuth({ issuer: 'http://example.okta.com' });
}

describe('token.decode', function() {

  it('correctly decodes a token', function() {
    var oa = setupSync();
    var decodedToken = oa.token.decode(tokens.unicodeToken);
    expect(decodedToken).toEqual(tokens.unicodeDecoded);
  });

  it('throws an error for a malformed token', function() {
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

describe('token.getWithoutPrompt', function() {
  it('uses default authorization parameters if undefined/null values are provided \
    when requesting an id_token using a sessionToken', function(done) {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect',
        scopes: null,
        responseType: undefined
      },
      getWithoutPromptArgs: {
        sessionToken: 'testSessionToken'
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
          'prompt': 'none',
          'sessionToken': 'testSessionToken'
        }
      }
    })
    .fin(function() {
      done();
    });
  });

  it('returns id_token using sessionToken', function(done) {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithoutPromptArgs: {
        sessionToken: 'testSessionToken'
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
          'prompt': 'none',
          'sessionToken': 'testSessionToken'
        }
      }
    })
    .fin(function() {
      done();
    });
  });

  it('returns id_token using sessionToken with issuer', function(done) {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithoutPromptArgs: {
        sessionToken: 'testSessionToken'
      },
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'id_token',
          'response_mode': 'okta_post_message',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'prompt': 'none',
          'sessionToken': 'testSessionToken'
        }
      },
      postMessageResp: {
        'id_token': tokens.authServerIdToken,
        'state': oauthUtil.mockedState
      },
      expectedResp: tokens.authServerIdTokenParsed
    })
    .fin(function() {
      done();
    });
  });

  it('returns id_token using sessionToken with issuer as id', function(done) {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        url: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect',
        issuer: 'aus8aus76q8iphupD0h7'
      },
      getWithoutPromptArgs: {
        sessionToken: 'testSessionToken'
      },
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'id_token',
          'response_mode': 'okta_post_message',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'prompt': 'none',
          'sessionToken': 'testSessionToken'
        }
      },
      postMessageResp: {
        'id_token': tokens.authServerIdToken,
        'state': oauthUtil.mockedState
      },
      expectedResp: tokens.authServerIdTokenParsed
    })
    .fin(function() {
      done();
    });
  });

  it('allows passing issuer through getWithoutPrompt, which takes precedence', function(done) {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com/oauth2/ORIGINAL_AUTH_SERVER_ID',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithoutPromptArgs: [{
        sessionToken: 'testSessionToken'
      }, {
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7'
      }],
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'id_token',
          'response_mode': 'okta_post_message',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'prompt': 'none',
          'sessionToken': 'testSessionToken'
        }
      },
      postMessageResp: {
        'id_token': tokens.authServerIdToken,
        'state': oauthUtil.mockedState
      },
      expectedResp: tokens.authServerIdTokenParsed
    })
    .fin(function() {
      done();
    });
  });

  it('allows passing issuer as an id through getWithoutPrompt, which takes precedence', function(done) {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com/oauth2/ORIGINAL_AUTH_SERVER_ID',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithoutPromptArgs: [{
        sessionToken: 'testSessionToken'
      }, {
        issuer: 'aus8aus76q8iphupD0h7'
      }],
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'id_token',
          'response_mode': 'okta_post_message',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'prompt': 'none',
          'sessionToken': 'testSessionToken'
        }
      },
      postMessageResp: {
        'id_token': tokens.authServerIdToken,
        'state': oauthUtil.mockedState
      },
      expectedResp: tokens.authServerIdTokenParsed
    })
    .fin(function() {
      done();
    });
  });

  it('returns id_token overriding all possible oauth params', function(done) {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithoutPromptArgs: {
        sessionToken: 'testSessionToken',
        clientId: 'someId',
        redirectUri: 'https://some.com/redirect',
        responseType: 'id_token',
        responseMode: 'okta_post_message',
        state: 'bbbbbb',
        nonce: 'cccccc',
        scopes: ['openid', 'custom'],
        maxAge: 1469481630,
        display: 'page' // will be forced to undefined
      },
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        queryParams: {
          'client_id': 'someId',
          'redirect_uri': 'https://some.com/redirect',
          'response_type': 'id_token',
          'response_mode': 'okta_post_message',
          'state': 'bbbbbb',
          'nonce': 'cccccc',
          'scope': 'openid custom',
          'prompt': 'none',
          'sessionToken': 'testSessionToken',
          'max_age': '1469481630'
        }
      },
      postMessageResp: {
        'id_token': tokens.modifiedIdToken,
        'state': 'bbbbbb'
      },
      expectedResp: {
        idToken: tokens.modifiedIdToken,
        claims: tokens.modifiedIdTokenClaims,
        expiresAt: 1449699930,
        scopes: ['openid', 'custom']
      }
    })
    .fin(function() {
      done();
    });
  });

  it('allows multiple iframes simultaneously', function(done) {
    return oauthUtil.setupSimultaneousPostMessage()
    .then(function(context) {
      // mock frame creation
      var body = document.getElementsByTagName('body')[0];
      var origAppend = body.appendChild;
      jest.spyOn(body, 'appendChild').mockImplementation(function(el) {
        if (el.tagName === 'IFRAME') {
          // Remove the src so it doesn't actually load
          el.src = '';
          return origAppend.call(this, el);
        }
        return origAppend.apply(this, arguments);
      });

      // ensure that no iframes are open
      var iframes = document.getElementsByTagName('IFRAME');
      expect(iframes.length).toBe(0);

      // getWithoutPrompt, but don't resolve
      var firstPrompt = context.client.token.getWithoutPrompt({
        sessionToken: 'testSessionToken',
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce
      });

      // getWithoutPrompt, but don't resolve
      var secondPrompt = context.client.token.getWithoutPrompt({
        sessionToken: 'testSessionToken2',
        state: oauthUtil.mockedState2,
        nonce: oauthUtil.mockedNonce2
      });

      // assert that two iframes are open
      expect(iframes.length).toBe(2);

      // resolve both prompts
      context.emitter.emit('trigger', oauthUtil.mockedState);
      context.emitter.emit('trigger', oauthUtil.mockedState2);

      return Q.all([firstPrompt, secondPrompt])
      .spread(function(firstToken, secondToken) {
        expect(firstToken).toEqual(tokens.standardIdTokenParsed);
        expect(secondToken).toEqual(tokens.standardIdToken2Parsed);

        // make sure both iframes were destroyed
        expect(iframes.length).toBe(0);

        // Remove any iframes that exist, so we don't taint our other tests
        oauthUtil.removeAllFrames();
      });
    })
    .fail(function() {
      expect('not to be hit').toBe(true);
    })
    .fin(function() {
      done();
    });
  });

  it('returns access_token using sessionToken', function(done) {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithoutPromptArgs: {
        responseType: 'token',
        sessionToken: 'testSessionToken'
      },
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
      expectedResp: tokens.standardAccessTokenParsed
    })
    .fin(function() {
      done();
    });
  });

  it('returns access_token using sessionToken with authorization server', function(done) {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithoutPromptArgs: {
        responseType: 'token',
        sessionToken: 'testSessionToken'
      },
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
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
        'access_token': tokens.authServerAccessToken,
        'token_type': 'Bearer',
        'expires_in': 3600,
        'state': oauthUtil.mockedState
      },
      expectedResp: tokens.authServerAccessTokenParsed
    })
    .fin(function() {
      done();
    });
  });

  it('returns access_token and id_token with an authorization server', function(done) {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithoutPromptArgs: {
        responseType: ['id_token', 'token'],
        sessionToken: 'testSessionToken'
      },
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
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
        'id_token': tokens.authServerIdToken,
        'access_token': tokens.authServerAccessToken,
        'token_type': 'Bearer',
        'expires_in': 3600,
        'state': oauthUtil.mockedState
      },
      expectedResp: [tokens.authServerIdTokenParsed, tokens.authServerAccessTokenParsed]
    })
    .fin(function() {
      done();
    });
  });

  it('returns id_token and access_token (in that order) using an array of responseTypes', function(done) {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithoutPromptArgs: {
        responseType: ['id_token', 'token'],
        sessionToken: 'testSessionToken'
      },
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
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
      expectedResp: [tokens.standardIdTokenParsed, tokens.standardAccessTokenParsed]
    })
    .fin(function() {
      done();
    });
  });

  it('returns access_token and id_token (in that order) using an array of responseTypes', function(done) {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithoutPromptArgs: {
        responseType: ['token', 'id_token'],
        sessionToken: 'testSessionToken'
      },
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
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
      expectedResp: [tokens.standardAccessTokenParsed, tokens.standardIdTokenParsed]
    })
    .fin(function() {
      done();
    });
  });

  it('returns a single token using an array with a single responseType', function(done) {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithoutPromptArgs: {
        responseType: ['id_token'],
        sessionToken: 'testSessionToken'
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
          'prompt': 'none',
          'sessionToken': 'testSessionToken'
        }
      },
      expectedResp: [tokens.standardIdTokenParsed]
    })
    .fin(function() {
      done();
    });
  });

  oauthUtil.itpErrorsCorrectly('throws an error if multiple responseTypes are sent as a string',
    {
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
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

describe('token.getWithPopup', function() {
  it('uses default authorization parameters if undefined/null values are provided \
    when requesting an id_token using idp', function(done) {
    return oauthUtil.setupPopup({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect',
        scopes: null,
        responseType: undefined
      },
      getWithPopupArgs: {
        idp: 'testIdp'
      },
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'id_token',
          'response_mode': 'okta_post_message',
          'display': 'popup',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'idp': 'testIdp'
        }
      }
    })
    .fin(function() {
      done();
    });
  });

  it('returns id_token using idp', function(done) {
      return oauthUtil.setupPopup({
        oktaAuthArgs: {
          issuer: 'https://auth-js-test.okta.com',
          clientId: 'NPSfOkH5eZrTy8PMDlvx',
          redirectUri: 'https://example.com/redirect'
        },
        getWithPopupArgs: {
          idp: 'testIdp'
        },
        postMessageSrc: {
          baseUri: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          queryParams: {
            'client_id': 'NPSfOkH5eZrTy8PMDlvx',
            'redirect_uri': 'https://example.com/redirect',
            'response_type': 'id_token',
            'response_mode': 'okta_post_message',
            'display': 'popup',
            'state': oauthUtil.mockedState,
            'nonce': oauthUtil.mockedNonce,
            'scope': 'openid email',
            'idp': 'testIdp'
          }
        }
      })
      .fin(function() {
        done();
      });
  });

  it('returns id_token using idp with authorization server', function(done) {
      return oauthUtil.setupPopup({
        oktaAuthArgs: {
          issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
          clientId: 'NPSfOkH5eZrTy8PMDlvx',
          redirectUri: 'https://example.com/redirect'
        },
        getWithPopupArgs: {
          idp: 'testIdp'
        },
        postMessageSrc: {
          baseUri: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
          queryParams: {
            'client_id': 'NPSfOkH5eZrTy8PMDlvx',
            'redirect_uri': 'https://example.com/redirect',
            'response_type': 'id_token',
            'response_mode': 'okta_post_message',
            'display': 'popup',
            'state': oauthUtil.mockedState,
            'nonce': oauthUtil.mockedNonce,
            'scope': 'openid email',
            'idp': 'testIdp'
          }
        },
        postMessageResp: {
          'id_token': tokens.authServerIdToken,
          'state': oauthUtil.mockedState
        },
        expectedResp: tokens.authServerIdTokenParsed
      })
      .fin(function() {
        done();
      });
  });

  it('allows passing issuer through getWithPopup, which takes precedence', function(done) {
      return oauthUtil.setupPopup({
        oktaAuthArgs: {
          issuer: 'https://auth-js-test.okta.com/oauth2/ORIGINAL_AUTH_SERVER_ID',
          clientId: 'NPSfOkH5eZrTy8PMDlvx',
          redirectUri: 'https://example.com/redirect'
        },
        getWithPopupArgs: [{
          idp: 'testIdp'
        }, {
          issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7'
        }],
        postMessageSrc: {
          baseUri: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
          queryParams: {
            'client_id': 'NPSfOkH5eZrTy8PMDlvx',
            'redirect_uri': 'https://example.com/redirect',
            'response_type': 'id_token',
            'response_mode': 'okta_post_message',
            'display': 'popup',
            'state': oauthUtil.mockedState,
            'nonce': oauthUtil.mockedNonce,
            'scope': 'openid email',
            'idp': 'testIdp'
          }
        },
        postMessageResp: {
          'id_token': tokens.authServerIdToken,
          'state': oauthUtil.mockedState
        },
        expectedResp: tokens.authServerIdTokenParsed
      })
      .fin(function() {
        done();
      });
  });

  it('allows multiple popups simultaneously', function(done) {
    return oauthUtil.setupSimultaneousPostMessage()
    .then(function(context) {
      // mock popup creation
      var popups = [];
      function getOpenPopups() {
        return popups.filter(function(popup) {
          return !popup.closed;
        });
      }
      function FakePopup() {
        var popup = this;
        popup.closed = false;
        popup.close = function() {
          popup.closed = true;
        };
      }
      jest.spyOn(window, 'open').mockImplementation(function() {
        var popup = new FakePopup();
        popups.push(popup);
        return popup;
      });

      // getWithPopup, but don't resolve
      var firstPopup = context.client.token.getWithPopup({
        idp: 'testIdp',
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce
      });

      // getWithPopup, but don't resolve
      var secondPopup = context.client.token.getWithPopup({
        idp: 'testIdp2',
        state: oauthUtil.mockedState2,
        nonce: oauthUtil.mockedNonce2
      });

      // assert that two popups are open
      expect(getOpenPopups().length).toBe(2);

      // resolve the popups
      context.emitter.emit('trigger', oauthUtil.mockedState);
      context.emitter.emit('trigger', oauthUtil.mockedState2);

      return Q.all([firstPopup, secondPopup])
      .spread(function(firstToken, secondToken) {
        expect(firstToken).toEqual(tokens.standardIdTokenParsed);
        expect(secondToken).toEqual(tokens.standardIdToken2Parsed);

        // make sure both popups were closed
        expect(getOpenPopups().length).toBe(0);
      });
    })
    .fail(function() {
      expect('not to be hit').toBe(true);
    })
    .fin(function() {
      done();
    });
  });

  it('returns access_token using sessionToken', function(done) {
    return oauthUtil.setupPopup({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithPopupArgs: {
        responseType: 'token',
        idp: 'testIdp'
      },
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'token',
          'response_mode': 'okta_post_message',
          'display': 'popup',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'idp': 'testIdp'
        }
      },
      time: 1449699929,
      postMessageResp: {
        'access_token': tokens.standardAccessToken,
        'token_type': 'Bearer',
        'expires_in': 3600,
        'state': oauthUtil.mockedState
      },
      expectedResp: tokens.standardAccessTokenParsed
    })
    .fin(function() {
      done();
    });
  });

  it('returns access_token using idp with authorization server', function(done) {
    return oauthUtil.setupPopup({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithPopupArgs: {
        responseType: 'token',
        idp: 'testIdp'
      },
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'token',
          'response_mode': 'okta_post_message',
          'display': 'popup',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'idp': 'testIdp'
        }
      },
      time: 1449699929,
      postMessageResp: {
        'access_token': tokens.authServerAccessToken,
        'token_type': 'Bearer',
        'expires_in': 3600,
        'state': oauthUtil.mockedState
      },
      expectedResp: tokens.authServerAccessTokenParsed
    })
    .fin(function() {
      done();
    });
  });

  it('returns access_token and id_token using idp with authorization server', function(done) {
    return oauthUtil.setupPopup({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithPopupArgs: {
        responseType: ['token', 'id_token'],
        idp: 'testIdp'
      },
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'token id_token',
          'response_mode': 'okta_post_message',
          'display': 'popup',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'idp': 'testIdp'
        }
      },
      time: 1449699929,
      postMessageResp: {
        'id_token': tokens.authServerIdToken,
        'access_token': tokens.authServerAccessToken,
        'token_type': 'Bearer',
        'expires_in': 3600,
        'state': oauthUtil.mockedState
      },
      expectedResp: [tokens.authServerAccessTokenParsed, tokens.authServerIdTokenParsed]
    })
    .fin(function() {
      done();
    });
  });

  it('returns access_token and id_token (in that order) using idp', function(done) {
    return oauthUtil.setupPopup({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithPopupArgs: {
        responseType: ['token', 'id_token'],
        idp: 'testIdp'
      },
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'token id_token',
          'response_mode': 'okta_post_message',
          'display': 'popup',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'idp': 'testIdp'
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
      expectedResp: [tokens.standardAccessTokenParsed, tokens.standardIdTokenParsed]
    })
    .fin(function() {
      done();
    });
  });

  it('returns id_token and access_token (in that order) using idp', function(done) {
    return oauthUtil.setupPopup({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithPopupArgs: {
        responseType: ['id_token', 'token'],
        idp: 'testIdp'
      },
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'id_token token',
          'response_mode': 'okta_post_message',
          'display': 'popup',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'idp': 'testIdp'
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
      expectedResp: [tokens.standardIdTokenParsed, tokens.standardAccessTokenParsed]
    })
    .fin(function() {
      done();
    });
  });
});

describe('token.getWithRedirect', function() {
  it('uses default authorization parameters if undefined/null values are provided \
    when minting an id_token using sessionToken', function() {
    oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        sessionToken: 'testToken',
        scopes: null,
        responseType: undefined
      },
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'id_token',
            state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: {
              issuer: 'https://auth-js-test.okta.com',
              authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
              userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
            },
            ignoreSignature: false
          })
        ],
        [
          'okta-oauth-nonce',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ],
        [
          'okta-oauth-state',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ]
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=id_token&' +
                            'response_mode=fragment&' +
                            'state=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'nonce=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'sessionToken=testToken&' +
                            'scope=openid%20email'
    });
  });
  it('sets authorize url and cookie for id_token using sessionToken', function() {
    oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        sessionToken: 'testToken'
      },
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'id_token',
            state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: {
              issuer: 'https://auth-js-test.okta.com',
              authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
              userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
            },
            ignoreSignature: false
          })
        ],
        [
          'okta-oauth-nonce',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ],
        [
          'okta-oauth-state',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ]
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=id_token&' +
                            'response_mode=fragment&' +
                            'state=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'nonce=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'sessionToken=testToken&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url and cookie for id_token using sessionToken and authorization server', function() {
    oauthUtil.setupRedirect({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithRedirectArgs: {
        sessionToken: 'testToken'
      },
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'id_token',
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: {
              issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
              authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
              userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
            },
            ignoreSignature: false
          })
        ],
        [
          'okta-oauth-nonce',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ],
        [
          'okta-oauth-state',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ]
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=id_token&' +
                            'response_mode=fragment&' +
                            'state=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'nonce=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'sessionToken=testToken&' +
                            'scope=openid%20email'
    });
  });

  it('allows passing issuer through getWithRedirect, which takes precedence', function() {
    oauthUtil.setupRedirect({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com/oauth2/ORIGINAL_AUTH_SERVER_ID',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithRedirectArgs: [{
        responseType: 'token',
        scopes: ['email'],
        sessionToken: 'testToken'
      }, {
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7'
      }],
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'token',
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: {
              issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
              authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
              userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
            },
            ignoreSignature: false
          })
        ],
        [
          'okta-oauth-nonce',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ],
        [
          'okta-oauth-state',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ]
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token&' +
                            'response_mode=fragment&' +
                            'state=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'nonce=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'sessionToken=testToken&' +
                            'scope=email'
    });
  });

  it('sets authorize url for access_token and don\'t throw an error if openid isn\'t included in scope', function() {
    oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        responseType: 'token',
        scopes: ['email'],
        sessionToken: 'testToken'
      },
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'token',
            state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            scopes: ['email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: {
              issuer: 'https://auth-js-test.okta.com',
              authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
              userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
            },
            ignoreSignature: false
          })
        ],
        [
          'okta-oauth-nonce',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ],
        [
          'okta-oauth-state',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ]
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token&' +
                            'response_mode=fragment&' +
                            'state=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'nonce=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'sessionToken=testToken&' +
                            'scope=email'
    });
  });

  it('sets authorize url and cookie for access_token using sessionToken and authorization server', function() {
    oauthUtil.setupRedirect({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithRedirectArgs: {
        responseType: 'token',
        scopes: ['email'],
        sessionToken: 'testToken'
      },
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'token',
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: {
              issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
              authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
              userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
            },
            ignoreSignature: false
          })
        ],
        [
          'okta-oauth-nonce',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ],
        [
          'okta-oauth-state',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ]
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token&' +
                            'response_mode=fragment&' +
                            'state=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'nonce=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'sessionToken=testToken&' +
                            'scope=email'
    });
  });

  it('sets authorize url for access_token and id_token using idp', function() {
    oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        responseType: ['token', 'id_token'],
        idp: 'testIdp'
      },
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: ['token', 'id_token'],
            state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: {
              issuer: 'https://auth-js-test.okta.com',
              authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
              userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
            },
            ignoreSignature: false
          })
        ],
        [
          'okta-oauth-nonce',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ],
        [
          'okta-oauth-state',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ]
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'response_mode=fragment&' +
                            'state=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'nonce=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'idp=testIdp&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url for access_token and id_token using idp and authorization server', function() {
    oauthUtil.setupRedirect({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithRedirectArgs: {
        responseType: ['token', 'id_token'],
        idp: 'testIdp'
      },
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: ['token', 'id_token'],
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: {
              issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
              authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
              userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
            },
            ignoreSignature: false
          })
        ],
        [
          'okta-oauth-nonce',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ],
        [
          'okta-oauth-state',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ]
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'response_mode=fragment&' +
                            'state=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'nonce=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'idp=testIdp&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url for authorization code requests, defaulting responseMode to query', function() {
    oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        sessionToken: 'testToken',
        responseType: 'code'
      },
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'code',
            state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: {
              issuer: 'https://auth-js-test.okta.com',
              authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
              userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
            },
            ignoreSignature: false
          })
        ],
        [
          'okta-oauth-nonce',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ],
        [
          'okta-oauth-state',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ]
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=code&' +
                            'response_mode=query&' +
                            'state=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'nonce=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'sessionToken=testToken&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url for authorization code requests with an authorization server', function() {
    oauthUtil.setupRedirect({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithRedirectArgs: {
        sessionToken: 'testToken',
        responseType: 'code'
      },
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'code',
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: {
              issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
              authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
              userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
            },
            ignoreSignature: false
          })
        ],
        [
          'okta-oauth-nonce',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ],
        [
          'okta-oauth-state',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ]
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=code&' +
                            'response_mode=query&' +
                            'state=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'nonce=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'sessionToken=testToken&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url for authorization code (as an array) requests, ' +
    'defaulting responseMode to query', function() {
    oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        sessionToken: 'testToken',
        responseType: ['code']
      },
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: ['code'],
            state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: {
              issuer: 'https://auth-js-test.okta.com',
              authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
              userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
            },
            ignoreSignature: false
          })
        ],
        [
          'okta-oauth-nonce',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ],
        [
          'okta-oauth-state',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ]
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=code&' +
                            'response_mode=query&' +
                            'state=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'nonce=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'sessionToken=testToken&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url for authorization code and id_token requests,' +
    ' defaulting responseMode to fragment', function() {
    oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        sessionToken: 'testToken',
        responseType: ['code', 'id_token']
      },
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: ['code', 'id_token'],
            state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: {
              issuer: 'https://auth-js-test.okta.com',
              authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
              userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
            },
            ignoreSignature: false
          })
        ],
        [
          'okta-oauth-nonce',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ],
        [
          'okta-oauth-state',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ]
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=code%20id_token&' +
                            'response_mode=fragment&' +
                            'state=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'nonce=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'sessionToken=testToken&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url for authorization code requests, allowing form_post responseMode', function() {
    oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        sessionToken: 'testToken',
        responseType: 'code',
        responseMode: 'form_post'
      },
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'code',
            state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: {
              issuer: 'https://auth-js-test.okta.com',
              authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
              userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
            },
            ignoreSignature: false
          })
        ],
        [
          'okta-oauth-nonce',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ],
        [
          'okta-oauth-state',
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        ]
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=code&' +
                            'response_mode=form_post&' +
                            'state=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'nonce=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&' +
                            'sessionToken=testToken&' +
                            'scope=openid%20email'
    });
  });
});

describe('token.parseFromUrl', function() {
  it('does not change the hash if a url is passed directly', function(done) {
    return oauthUtil.setupParseUrl({
      directUrl: 'http://example.com#id_token=' + tokens.standardIdToken +
                '&state=' + oauthUtil.mockedState,
      oauthCookie: JSON.stringify({
        responseType: 'id_token',
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }),
      expectedResp: {
        idToken: tokens.standardIdToken,
        claims: tokens.standardIdTokenClaims,
        expiresAt: 1449699930,
        scopes: ['openid', 'email']
      }
    })
    .fin(function() {
      done();
    });
  });

  it('uses location.hash to remove token if history.replaceState does not exist', function(done) {
    return oauthUtil.setupParseUrl({
      noHistory: true,
      hashMock: '#id_token=' + tokens.standardIdToken +
                '&state=' + oauthUtil.mockedState,
      oauthCookie: JSON.stringify({
        responseType: 'id_token',
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }),
      expectedResp: {
        idToken: tokens.standardIdToken,
        claims: tokens.standardIdTokenClaims,
        expiresAt: 1449699930,
        scopes: ['openid', 'email']
      }
    })
    .fin(function() {
      done();
    });
  });

  it('parses id_token', function(done) {
    return oauthUtil.setupParseUrl({
      hashMock: '#id_token=' + tokens.standardIdToken +
                '&state=' + oauthUtil.mockedState,
      oauthCookie: JSON.stringify({
        responseType: 'id_token',
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }),
      expectedResp: {
        idToken: tokens.standardIdToken,
        claims: tokens.standardIdTokenClaims,
        expiresAt: 1449699930,
        scopes: ['openid', 'email']
      }
    })
    .fin(function() {
      done();
    });
  });

  it('parses id_token with authorization server issuer', function(done) {
    return oauthUtil.setupParseUrl({
      hashMock: '#id_token=' + tokens.authServerIdToken +
                '&state=' + oauthUtil.mockedState,
      oauthCookie: JSON.stringify({
        responseType: 'id_token',
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
        }
      }),
      expectedResp: tokens.authServerIdTokenParsed
    })
    .fin(function() {
      done();
    });
  });

  it('parses access_token', function(done) {
    return oauthUtil.setupParseUrl({
      time: 1449699929,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthCookie: JSON.stringify({
        responseType: 'token',
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }),
      expectedResp: tokens.standardAccessTokenParsed
    })
    .fin(function() {
      done();
    });
  });

  it('parses access_token with authorization server issuer', function(done) {
    return oauthUtil.setupParseUrl({
      time: 1449699929,
      hashMock: '#access_token=' + tokens.authServerAccessToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthCookie: JSON.stringify({
        responseType: 'token',
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
        }
      }),
      expectedResp: tokens.authServerAccessTokenParsed
    })
    .fin(function() {
      done();
    });
  });

  it('parses access_token and id_token', function(done) {
    return oauthUtil.setupParseUrl({
      time: 1449699929,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&id_token=' + tokens.standardIdToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthCookie: JSON.stringify({
        responseType: ['id_token', 'token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }),
      expectedResp: [tokens.standardIdTokenParsed, tokens.standardAccessTokenParsed]
    })
    .fin(function() {
      done();
    });
  });

  it('parses access_token and id_token with authorization server issuer', function(done) {
    return oauthUtil.setupParseUrl({
      time: 1449699929,
      hashMock: '#access_token=' + tokens.authServerAccessToken +
                '&id_token=' + tokens.authServerIdToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthCookie: JSON.stringify({
        responseType: ['id_token', 'token'],
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
        }
      }),
      expectedResp: [tokens.authServerIdTokenParsed, tokens.authServerTokenParsed]
    })
    .fin(function() {
      done();
    });
  });

  it('parses access_token, id_token, and code', function(done) {
    return oauthUtil.setupParseUrl({
      time: 1449699929,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&id_token=' + tokens.standardIdToken +
                '&code=' + tokens.standardAuthorizationCode +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthCookie: JSON.stringify({
        responseType: ['id_token', 'token', 'code'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }),
      expectedResp: [tokens.standardIdTokenParsed, tokens.standardAccessTokenParsed, {
        authorizationCode: tokens.standardAuthorizationCode
      }]
    })
    .fin(function() {
      done();
    });
  });

  it('parses access_token, code, and id_token, but one isn\'t returned', function(done) {
    return oauthUtil.setupParseUrl({
      time: 1449699929,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&id_token=' + tokens.standardIdToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthCookie: JSON.stringify({
        responseType: ['id_token', 'code', 'token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }),
      expectedResp: [tokens.standardIdTokenParsed, undefined, tokens.standardAccessTokenParsed]
    })
    .fin(function() {
      done();
    });
  });

  it('parses access_token, id_token, and code with authorization server issuer', function(done) {
    return oauthUtil.setupParseUrl({
      time: 1449699929,
      hashMock: '#access_token=' + tokens.authServerAccessToken +
                '&id_token=' + tokens.authServerIdToken +
                '&code=' + tokens.standardAuthorizationCode +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthCookie: JSON.stringify({
        responseType: ['id_token', 'token', 'code'],
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
        }
      }),
      expectedResp: [tokens.authServerIdTokenParsed, tokens.authServerAccessTokenParsed, {
        authorizationCode: tokens.standardAuthorizationCode
      }]
    })
    .fin(function() {
      done();
    });
  });

  oauthUtil.itpErrorsCorrectly('throws an error if nothing to parse',
    {
      setupMethod: oauthUtil.setupParseUrl,
      hashMock: '',
      oauthCookie: JSON.stringify({
        responseType: ['id_token', 'token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      })
    },
    {
      name: 'AuthSdkError',
      message: 'Unable to parse a token from the url',
      errorCode: 'INTERNAL',
      errorSummary: 'Unable to parse a token from the url',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    }
  );

  oauthUtil.itpErrorsCorrectly('throws an error if no cookie set',
    {
      setupMethod: oauthUtil.setupParseUrl,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&id_token=' + tokens.standardIdToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthCookie: ''
    },
    {
      name: 'AuthSdkError',
      message: 'Unable to retrieve OAuth redirect params cookie',
      errorCode: 'INTERNAL',
      errorSummary: 'Unable to retrieve OAuth redirect params cookie',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    }
  );

  oauthUtil.itpErrorsCorrectly('throws an error if state doesn\'t match',
    {
      setupMethod: oauthUtil.setupParseUrl,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&id_token=' + tokens.standardIdToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthCookie: JSON.stringify({
        responseType: ['id_token', 'token'],
        state: 'mismatchedState',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      })
    },
    {
      name: 'AuthSdkError',
      message: 'OAuth flow response state doesn\'t match request state',
      errorCode: 'INTERNAL',
      errorSummary: 'OAuth flow response state doesn\'t match request state',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    }
  );

  oauthUtil.itpErrorsCorrectly('throws an error if nonce doesn\'t match',
    {
      setupMethod: oauthUtil.setupParseUrl,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&id_token=' + tokens.standardIdToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthCookie: JSON.stringify({
        responseType: ['id_token', 'token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'mismatchedNonce',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      })
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
});

describe('token.renew', function() {
  it('returns id_token', function(done) {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      tokenRenewArgs: [tokens.standardIdTokenParsed],
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
      }
    })
    .fin(function() {
      done();
    });
  });

  it('returns id_token with authorization server', function(done) {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      tokenRenewArgs: [tokens.authServerIdTokenParsed],
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
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
        'id_token': tokens.authServerIdToken,
        'state': oauthUtil.mockedState
      },
      expectedResp: {
        idToken: tokens.authServerIdToken,
        claims: tokens.authServerIdTokenClaims,
        expiresAt: 1449699930,
        scopes: ['openid', 'custom'],
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7'
      }
    })
    .fin(function() {
      done();
    });
  });

  it('returns access_token', function(done) {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      tokenRenewArgs: [tokens.standardAccessTokenParsed],
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
        tokenType: 'Bearer',
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7'
      }
    })
    .fin(function() {
      done();
    });
  });

  it('returns access_token with authorization server', function(done) {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com/oauth2/wontusethisone',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      tokenRenewArgs: [tokens.authServerAccessTokenParsed],
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
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
        tokenType: 'Bearer',
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7'
      }
    })
    .fin(function() {
      done();
    });
  });

  oauthUtil.itpErrorsCorrectly('throws an error if a non-token is passed',
    {
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      tokenRenewArgs: [{non:'token'}]
    },
    {
      name: 'AuthSdkError',
      message: 'Renew must be passed a token with an array of scopes and an accessToken or idToken',
      errorCode: 'INTERNAL',
      errorSummary: 'Renew must be passed a token with an array of scopes and an accessToken or idToken',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    }
  );
});

describe('token.getUserInfo', function() {
  util.itMakesCorrectRequestResponse({
    title: 'allows retrieving UserInfo',
    setup: {
      request: {
        uri: '/oauth2/v1/userinfo',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Okta-User-Agent-Extended': 'okta-auth-js-' + packageJson.version,
          'Authorization': 'Bearer ' + tokens.standardAccessToken
        }
      },
      response: 'userinfo'
    },
    execute: function(test) {
      return test.oa.token.getUserInfo(tokens.standardAccessTokenParsed);
    },
    expectations: function(test, res) {
      expect(res).toEqual({
        'sub': '00u15ozp26ACQTGHJEBH',
        'email': 'samljackson@example.com',
        'email_verified': true
      });
    }
  });

  util.itMakesCorrectRequestResponse({
    title: 'allows retrieving UserInfo using authorization server',
    setup: {
      request: {
        uri: '/oauth2/aus8aus76q8iphupD0h7/v1/userinfo',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Okta-User-Agent-Extended': 'okta-auth-js-' + packageJson.version,
          'Authorization': 'Bearer ' + tokens.authServerAccessToken
        }
      },
      response: 'userinfo'
    },
    execute: function(test) {
      return test.oa.token.getUserInfo(tokens.authServerAccessTokenParsed);
    },
    expectations: function(test, res) {
      expect(res).toEqual({
        'sub': '00u15ozp26ACQTGHJEBH',
        'email': 'samljackson@example.com',
        'email_verified': true
      });
    }
  });

  it('throws an error if no arguments are passed instead', function(done) {
    return Q.resolve(setupSync())
    .then(function(oa) {
      return oa.token.getUserInfo();
    })
    .then(function() {
      expect('not to be hit').toBe(true);
    })
    .fail(function(err) {
      expect(err.name).toEqual('AuthSdkError');
      expect(err.errorSummary).toBe('getUserInfo requires an access token object');
    })
    .fin(function() {
      done();
    });
  });

  it('throws an error if a string is passed instead of an accessToken object', function(done) {
    return Q.resolve(setupSync())
    .then(function(oa) {
      return oa.token.getUserInfo('just a string');
    })
    .then(function() {
      expect('not to be hit').toBe(true);
    })
    .fail(function(err) {
      expect(err.name).toEqual('AuthSdkError');
      expect(err.errorSummary).toBe('getUserInfo requires an access token object');
    })
    .fin(function() {
      done();
    });
  });

  util.itErrorsCorrectly({
    title: 'returns correct error for 403',
    setup: {
      request: {
        uri: '/oauth2/v1/userinfo',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Okta-User-Agent-Extended': 'okta-auth-js-' + packageJson.version,
          'Authorization': 'Bearer ' + tokens.standardAccessToken
        }
      },
      response: 'error-userinfo-insufficient-scope'
    },
    execute: function(test) {
      return test.oa.token.getUserInfo(tokens.standardAccessTokenParsed);
    },
    expectations: function(test, err) {
      expect(err.name).toEqual('OAuthError');
      expect(err.message).toEqual('The access token must provide access to at least one' +
        ' of these scopes - profile, email, address or phone');
      expect(err.errorCode).toEqual('insufficient_scope');
      expect(err.errorSummary).toEqual('The access token must provide access to at least one' +
        ' of these scopes - profile, email, address or phone');
    }
  });

  util.itErrorsCorrectly({
    title: 'returns correct error for 401',
    setup: {
      request: {
        uri: '/oauth2/v1/userinfo',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Okta-User-Agent-Extended': 'okta-auth-js-' + packageJson.version,
          'Authorization': 'Bearer ' + tokens.standardAccessToken
        }
      },
      response: 'error-userinfo-invalid-token'
    },
    execute: function(test) {
      return test.oa.token.getUserInfo(tokens.standardAccessTokenParsed);
    },
    expectations: function(test, err) {
      expect(err.name).toEqual('OAuthError');
      expect(err.message).toEqual('The access token is invalid.');
      expect(err.errorCode).toEqual('invalid_token');
      expect(err.errorSummary).toEqual('The access token is invalid.');
    }
  });
});

describe('token.verify', function() {
  var validationParams = {
    clientId: tokens.standardIdTokenParsed.clientId,
    issuer: tokens.standardIdTokenParsed.issuer
  };

  it('verifies a valid idToken with nonce', function(done) {
    var client = setupSync();
    util.warpToUnixTime(1449699929);
    oauthUtil.loadWellKnownAndKeysCache();
    var alteredParams = _.clone(validationParams);
    alteredParams.nonce = tokens.standardIdTokenParsed.nonce;
    client.token.verify(tokens.standardIdTokenParsed, validationParams)
    .then(function(res) {
      expect(res).toEqual(tokens.standardIdTokenParsed);
    })
    .fail(function() {
      expect('not to be hit').toEqual(true);
    })
    .fin(done);
  });
  it('verifies a valid idToken without nonce', function(done) {
    var client = setupSync();
    util.warpToUnixTime(1449699929);
    oauthUtil.loadWellKnownAndKeysCache();
    client.token.verify(tokens.standardIdTokenParsed, validationParams)
    .then(function(res) {
      expect(res).toEqual(tokens.standardIdTokenParsed);
    })
    .fail(function() {
      expect('not to be hit').toEqual(true);
    })
    .fin(done);
  });

  describe('rejects a token', function() {
    beforeEach(function() {
      jest.useFakeTimers();
    });

    function expectError(verifyArgs, message, done) {
      var client = setupSync();
      return client.token.verify.apply(null, verifyArgs)
      .then(function() {
        expect('not to be hit').toEqual(true);
      })
      .fail(function(err) {
        util.assertAuthSdkError(err, message);
      })
      .fin(done);
    }

    it('isn\'t an idToken', function(done) {
      expectError([tokens.standardAccessTokenParsed],
        'Only idTokens may be verified')
      .fin(done);
    });
    it('issued in the future', function(done) {
      util.warpToDistantPast();
      expectError([tokens.standardIdTokenParsed, validationParams],
        'The JWT was issued in the future')
      .fin(done);
    });
    it('expired', function(done) {
      util.warpToDistantFuture();
      expectError([tokens.standardIdTokenParsed, validationParams],
        'The JWT expired and is no longer valid')
      .fin(done);
    });
    it('invalid nonce', function(done) {
      var alteredParams = _.clone(validationParams);
      alteredParams.nonce = 'invalidNonce';
      expectError([tokens.standardIdToken2Parsed, alteredParams],
        'OAuth flow response nonce doesn\'t match request nonce')
      .fin(done);
    });
    it('invalid audience', function(done) {
      var alteredParams = _.clone(validationParams);
      alteredParams.clientId = 'invalidAudience';
      expectError([tokens.standardIdTokenParsed, alteredParams],
        'The audience [NPSfOkH5eZrTy8PMDlvx] does not match [invalidAudience]')
      .fin(done);
    });
    it('invalid issuer', function(done) {
      var alteredParams = _.clone(validationParams);
      alteredParams.issuer = 'http://invalidissuer.example.com';
      expectError([tokens.standardIdTokenParsed, alteredParams],
        'The issuer [https://auth-js-test.okta.com] does not match [http://invalidissuer.example.com]')
      .fin(done);
    });
    it('expired before issued', function(done) {
      expectError([tokens.expiredBeforeIssuedIdTokenParsed, validationParams],
        'The JWT expired before it was issued')
      .fin(done);
    });
  });
});
