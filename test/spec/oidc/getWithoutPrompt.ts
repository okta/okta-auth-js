/* global window, document */

// mock OAuth util
const generateState = jest.fn();
jest.mock('../../../lib/oidc/util/oauth', () => {
  const { generateNonce, getOAuthUrls } = jest.requireActual('../../../lib/oidc/util/oauth');
  return { generateState, generateNonce, getOAuthUrls };
});

import { OktaAuth } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import util from '@okta/test.support/util';
import oauthUtil from '@okta/test.support/oauthUtil';
import waitFor from '@okta/test.support/waitFor';

describe('token.getWithoutPrompt', function() {
  beforeEach(() => {
    generateState.mockReturnValue(oauthUtil.mockedState);
  });
  afterEach(function() {
    jest.useRealTimers();
  });
  describe('concurrent requests', function() {
    var authClient;
    var states;
    var messageCallbacks;
    var body;

    function fireCallback(index, origin?) {
      var fn = messageCallbacks[index];
      fn({
        data: {
          'id_token': tokens.standardIdToken,
          'access_token': tokens.standardAccessToken,
          state: states[index],
        },
        origin: origin || 'https://auth-js-test.okta.com'
      });
    }

    beforeEach(function() {
      var oktaAuthArgs = {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      };
      authClient = new OktaAuth(oktaAuthArgs);
      states = [];
      messageCallbacks = [];

      // Mock the well-known and keys request
      oauthUtil.loadWellKnownAndKeysCache(authClient);
      oauthUtil.mockStateAndNonce();
      util.warpToUnixTime(oauthUtil.getTime());
  
      // Unique state per request
      var stateCounter = 0;
      generateState.mockImplementation(function() {
        stateCounter++;
        states.push(stateCounter);
        return states[states.length - 1];
      });
  
      // Simulate the postMessage between the window and the popup or iframe
      jest.spyOn(window, 'addEventListener').mockImplementation(function(eventName, fn) {
        if (eventName === 'message') {
          messageCallbacks.push(fn);
        }
      });

      // Capture the iframe
      body = document.getElementsByTagName('body')[0];
      var origAppend = body.appendChild;
      jest.spyOn(body, 'appendChild').mockImplementation(function (el: HTMLFrameElement) {
        if (el.tagName === 'IFRAME') {
          // Remove the src so it doesn't actually load
          el.src = '';
          return origAppend.call(this, el);
        }
        return origAppend.apply(this, arguments);
      });

      jest.spyOn(body, 'removeChild');
    });

    // asserts that multiple iframes are not opened simultaneously
    it('multiple valid concurrent calls will resolve sequentially', function() {
      var p1 = authClient.token.getWithoutPrompt();
      var p2 = authClient.token.getWithoutPrompt();
      expect(body.appendChild).not.toHaveBeenCalled(); // prepareOauthParams is async
      return waitFor(() => {
        return body.appendChild.mock.calls.length > 0;
      }).then(() => {
        expect(body.appendChild).toHaveBeenCalledTimes(1);
        body.appendChild.mockClear();
        fireCallback(0); // will resolve the first call
        return p1;
      }).then(() => {
        // expect that the iframe from the first call has been removed
        expect(body.removeChild).toHaveBeenCalledTimes(1);
        body.removeChild.mockClear();
        // wait for the 2nd call to open an iframe
        return waitFor(function() {
          return body.appendChild.mock.calls.length > 0;
        });
      }).then(() => {
        expect(body.appendChild).toHaveBeenCalledTimes(1);
        fireCallback(1); // resolve 2nd call
        return p2;
      })
      .then(() => {
        // expect that the iframe from the second call has been removed
        expect(body.removeChild).toHaveBeenCalledTimes(1);
      });
    });

    it('multiple invalid (authorizeUrl mismatch) concurrent will fail sequentially', function() {
      var p1 = authClient.token.getWithoutPrompt();
      var p2 = authClient.token.getWithoutPrompt();
      expect(body.appendChild).not.toHaveBeenCalled(); // prepareOauthParams is async
      return waitFor(() => {
        return body.appendChild.mock.calls.length > 0;
      }).then(() => {
        expect(body.appendChild).toHaveBeenCalledTimes(1);
        body.appendChild.mockClear();
        fireCallback(0, 'bogus'); // will resolve (with failure) the first call
        return p1;
      }).catch(err => {
        util.expectErrorToEqual(err, {
          name: 'AuthSdkError',
          message: 'The request does not match client configuration',
          errorCode: 'INTERNAL',
          errorSummary: 'The request does not match client configuration',
          errorLink: 'INTERNAL',
          errorId: 'INTERNAL',
          errorCauses: []
        });
        // expect that the iframe from the first call has been removed
        expect(body.removeChild).toHaveBeenCalledTimes(1);
        body.removeChild.mockClear();
        // wait for the 2nd call to open an iframe
        return waitFor(function() {
          return body.appendChild.mock.calls.length > 0;
        });
      }).then(() => {
        expect(body.appendChild).toHaveBeenCalledTimes(1);
        fireCallback(1, 'bogus'); // resolve 2nd call
        return p2;
      }).catch(err => {
        util.expectErrorToEqual(err, {
          name: 'AuthSdkError',
          message: 'The request does not match client configuration',
          errorCode: 'INTERNAL',
          errorSummary: 'The request does not match client configuration',
          errorLink: 'INTERNAL',
          errorId: 'INTERNAL',
          errorCauses: []
        });
        // expect that the iframe from the second call has been removed
        expect(body.removeChild).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('If extra options are passed, promise will reject', function() {
    return oauthUtil.setupFrame({
      willFail: true,
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
      },
      getWithoutPromptArgs: [{
        /* expected options */
      }, {
        /* extra options */
      }]
    })
    .then(function() {
      expect(true).toEqual(false);
    })
    .catch(function(err) {
      util.expectErrorToEqual(err, {
        name: 'AuthSdkError',
        message: 'As of version 3.0, "getWithoutPrompt" takes only a single set of options',
        errorCode: 'INTERNAL',
        errorSummary: 'As of version 3.0, "getWithoutPrompt" takes only a single set of options',
        errorLink: 'INTERNAL',
        errorId: 'INTERNAL',
        errorCauses: []
      });
    });
  });

  it('If authorizeUrl does not match configured issuer, promise will reject', function() {
    return oauthUtil.setupFrame({
      willFail: true,
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithoutPromptArgs: [{
        sessionToken: 'testSessionToken',
        authorizeUrl: 'https://bogus',
      }],
      postMessageSrc: {
        baseUri: 'https://bogus'
      }
    })
    .then(function() {
      expect(true).toEqual(false);
    })
    .catch(function(err) {
      util.expectErrorToEqual(err, {
        name: 'AuthSdkError',
        message: 'The request does not match client configuration',
        errorCode: 'INTERNAL',
        errorSummary: 'The request does not match client configuration',
        errorLink: 'INTERNAL',
        errorId: 'INTERNAL',
        errorCauses: []
      });
    });
  });

  it('returns tokens using sessionToken', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
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
          'response_type': 'token id_token',
          'response_mode': 'okta_post_message',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'prompt': 'none',
          'sessionToken': 'testSessionToken'
        }
      }
    });
  });

  it('returns tokens using sessionToken with issuer', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
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
          'response_type': 'token id_token',
          'response_mode': 'okta_post_message',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'prompt': 'none',
          'sessionToken': 'testSessionToken'
        }
      },
      postMessageResp: {
        'access_token': tokens.authServerAccessToken,
        'id_token': tokens.authServerIdToken,
        'state': oauthUtil.mockedState
      },
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          idToken: tokens.authServerIdTokenParsed
        }
      }
    });
  });

  it('returns tokens using sessionToken with issuer as id', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        pkce: false,
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect',
      },
      getWithoutPromptArgs: {
        sessionToken: 'testSessionToken'
      },
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
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
      postMessageResp: {
        'access_token': tokens.authServerAccessToken,
        'id_token': tokens.authServerIdToken,
        'state': oauthUtil.mockedState
      },
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          idToken: tokens.authServerIdTokenParsed
        }
      }
    });
  });

  it('allows passing issuer through getWithoutPrompt, which takes precedence', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com/oauth2/ORIGINAL_AUTH_SERVER_ID',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithoutPromptArgs: [{
        sessionToken: 'testSessionToken',
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7'
      }],
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
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
      postMessageResp: {
        'access_token': tokens.authServerAccessToken,
        'id_token': tokens.authServerIdToken,
        'state': oauthUtil.mockedState
      },
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          idToken: tokens.authServerIdTokenParsed
        }
      }
    });
  });

  it('returns id_token overriding all possible oauth params', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
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
        state: 'bbbbbb',
        tokens: {
          idToken: {
            idToken: tokens.modifiedIdToken,
            claims: tokens.modifiedIdTokenClaims,
            expiresAt: 1449699930,
            scopes: ['openid', 'custom']
          }
        }
      }
    });
  });

  it('prevents multiple iframes from opening simultaneously', function() {
    var iframes;
    var firstPrompt;
    var secondPrompt;
    var body;
    return oauthUtil.setupSimultaneousPostMessage()
    .then(function(context) {
      // mock frame creation
      body = document.getElementsByTagName('body')[0];
      var origAppend = body.appendChild;
      jest.spyOn(body, 'appendChild').mockImplementation(function(el: HTMLFrameElement) {
        if (el.tagName === 'IFRAME') {
          // Remove the src so it doesn't actually load
          el.src = '';
          return origAppend.call(this, el);
        }
        return origAppend.apply(this, arguments);
      });
      jest.spyOn(body, 'removeChild');
      // ensure that no iframes are open
      iframes = document.getElementsByTagName('IFRAME');
      expect(iframes.length).toBe(0);

      // getWithoutPrompt, but don't resolve
      firstPrompt = context.client.token.getWithoutPrompt({
        responseType: 'id_token',
        sessionToken: 'testSessionToken',
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce
      });

      // getWithoutPrompt, but don't resolve
      secondPrompt = context.client.token.getWithoutPrompt({
        responseType: 'id_token',
        sessionToken: 'testSessionToken2',
        state: oauthUtil.mockedState2,
        nonce: oauthUtil.mockedNonce2
      });
      return waitFor(function() {
        return iframes.length > 0 ? context : false;
      });
    })
    .then(function(context) {
      // assert that only one iframe is open
      expect(iframes.length).toBe(1);

      // resolve first prompt
      context.emitter.emit('trigger', oauthUtil.mockedState);
      return firstPrompt.then(val => {
        expect(val.tokens.idToken).toEqual(tokens.standardIdTokenParsed);
        return context;
      });
    }).then(context => {
      expect(body.removeChild).toHaveBeenCalled(); // expect first frame to be closed
      body.removeChild.mockClear();
      return waitFor(function() {
        return iframes.length > 0 ? context : false;
      });
    }).then(context => {
      // assert that only one iframe is open
      expect(iframes.length).toBe(1);
      context.emitter.emit('trigger', oauthUtil.mockedState2);
      return secondPrompt.then(val => {
        expect(val.tokens.idToken).toEqual(tokens.standardIdToken2Parsed);
        return context;
      });
    }).then(() => {
        expect(body.removeChild).toHaveBeenCalled(); // expect 2nd frame to be closed
        expect(iframes.length).toBe(0); 
        // Remove any iframes that exist, so we don't taint our other tests
        oauthUtil.removeAllFrames();
    });
  });

  it('returns access_token using sessionToken', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
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
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.standardAccessTokenParsed
        }
      }
    });
  });

  it('returns access_token using sessionToken with authorization server', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
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
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.authServerAccessTokenParsed
        }
      }
    });
  });

  it('returns access_token and id_token with an authorization server', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
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
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          idToken: tokens.authServerIdTokenParsed,
          accessToken: tokens.authServerAccessTokenParsed
        }
      }
    });
  });

  it('returns id_token and access_token using an array of responseTypes (in that order)', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
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
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          idToken: tokens.standardIdTokenParsed,
          accessToken: tokens.standardAccessTokenParsed
        }
      }
    });
  });

  it('returns access_token and id_token using an array of responseTypes (in that order)', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
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
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.standardAccessTokenParsed,
          idToken: tokens.standardIdTokenParsed
        }
      }
    });
  });

  it('returns a single token using an array with a single responseType', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
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
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          idToken: tokens.standardIdTokenParsed
        }
      }
    });
  });

  it('throws an error if multiple responseTypes are sent as a string', () => {
    const error = {
      name: 'AuthSdkError',
      message: 'Multiple OAuth responseTypes must be defined as an array',
      errorCode: 'INTERNAL',
      errorSummary: 'Multiple OAuth responseTypes must be defined as an array',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    };

    return oauthUtil.setupFrame({
      willFail: true,
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithoutPromptArgs: {
        responseType: 'id_token token',
        sessionToken: 'testSessionToken'
      }
    })
    .catch(function(e) {
      util.expectErrorToEqual(e, error);
    });
  });

});
