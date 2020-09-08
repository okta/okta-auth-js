/* global window, document, btoa */
jest.mock('cross-fetch');
import allSettled from 'promise.allsettled';
allSettled.shim(); // will be a no-op if not needed

import _ from 'lodash';
import { OktaAuth, AuthSdkError } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import util from '@okta/test.support/util';
import oauthUtil from '@okta/test.support/oauthUtil';
import waitFor from '@okta/test.support/waitFor';
import packageJson from '../../package.json';
import * as sdkUtil from '../../lib/oauthUtil';
import pkce from '../../lib/pkce';
import http from '../../lib/http';
import * as sdkCrypto from '../../lib/crypto';

function setupSync(options) {
  options = Object.assign({ issuer: 'http://example.okta.com', pkce: false }, options);
  return new OktaAuth(options);
}

// Expected settings when testing on HTTP protocol
var insecureCookieSettings = {
  secure: false,
  sameSite: 'lax'
};

// Expected settings when testing on HTTPS protocol
var secureCookieSettings = {
  secure: true,
  sameSite: 'none'
};

describe('token.revoke', function() {
  it('throws if token is not passed', function() {
    var oa = setupSync();
    return oa.token.revoke()
      .catch(function(err) {
        util.assertAuthSdkError(err, 'A valid access token object is required');
      });
  });
  it('throws if invalid token is passed', function() {
    var oa = setupSync();
    var accessToken = { foo: 'bar' };
    return oa.token.revoke(accessToken)
      .catch(function(err) {
        util.assertAuthSdkError(err, 'A valid access token object is required');
      });
  });
  it('throws if clientId is not set', function() {
    var oa = setupSync();
    var accessToken = { accessToken: 'fake' };
    return oa.token.revoke(accessToken)
      .catch(function(err) {
        util.assertAuthSdkError(err, 'A clientId must be specified in the OktaAuth constructor to revoke a token');
      });
  });
  it('makes a POST to /v1/revoke', function() {
    spyOn(http, 'post').and.returnValue(Promise.resolve());
    var clientId = 'fake-client-id';
    var oa = setupSync({ clientId: clientId });
    var accessToken = { accessToken: 'fake/ &token' };
    return oa.token.revoke(accessToken)
      .then(function() {
        expect(http.post).toHaveBeenCalledWith(oa, 
          'http://example.okta.com/oauth2/v1/revoke', 
          'token_type_hint=access_token&token=fake%2F%20%26token', {
            headers: {
              'Authorization': 'Basic ' + btoa(clientId),
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
      });
  });
  it('will throw if http.post rejects', function() {
    var testError = new Error('test error');
    spyOn(http, 'post').and.callFake(function() {
      return Promise.reject(testError);
    });
    var clientId = 'fake-client-id';
    var oa = setupSync({ clientId: clientId });
    var accessToken = { accessToken: 'fake/ &token' };
    return oa.token.revoke(accessToken)
      .catch(function(err) {
        expect(err).toBe(testError);
      });
  });
});

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
  afterEach(function() {
    jest.useRealTimers();
  });
  describe('concurrent requests', function() {
    var authClient;
    var states;
    var messageCallbacks;
    var body;

    function fireCallback(index, origin) {
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
      oauthUtil.loadWellKnownAndKeysCache();
      oauthUtil.mockStateAndNonce();
      util.warpToUnixTime(oauthUtil.getTime());
  
      // Unique state per request
      var stateCounter = 0;
      jest.spyOn(sdkUtil, 'generateState').mockImplementation(function() {
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
      jest.spyOn(body, 'appendChild').mockImplementation(function (el) {
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
      jest.spyOn(body, 'appendChild').mockImplementation(function(el) {
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

  it('should throw AuthSdkError when in callback state', async () => {
    delete global.window.location;
    global.window.location = {
      protocol: 'https:',
      hostname: 'somesite.local',
      search: '?code=fakecode'
    };
    const client = new OktaAuth({
      pkce: true,
      issuer: 'https://auth-js-test.okta.com',
      clientId: 'foo'
    });

    try {
      await client.token.getWithoutPrompt();
    } catch (err) {
      expect(err).toBeInstanceOf(AuthSdkError);
      expect(err.message).toBe('The app should not attempt to call getToken on callback. Authorize flow is already in process. Use parseFromUrl() to receive tokens.');
    }
  });
});

describe('token.getWithPopup', function() {
  afterEach(function() {
    jest.useRealTimers();
  });

  it('promise will reject if extra options object is passed', function() {
    return oauthUtil.setup({
      willFail: true,
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
      },
      getWithPopupArgs: [{
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
        message: 'As of version 3.0, "getWithPopup" takes only a single set of options',
        errorCode: 'INTERNAL',
        errorSummary: 'As of version 3.0, "getWithPopup" takes only a single set of options',
        errorLink: 'INTERNAL',
        errorId: 'INTERNAL',
        errorCauses: []
      });
    });
  });

  it('promise will reject if fails due to timeout', function() {
    var timeoutMs = 120000;
    var mockWindow = {
      closed: false,
      close: jest.fn()
    };
    jest.spyOn(window, 'open').mockImplementation(function () {
      return mockWindow; // valid window is returned
    });
    jest.useFakeTimers();
    var promise = oauthUtil.setup({
      closePopup: true, // prevent any message being passed
      willFail: true,
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithPopupArgs: {
        responseType: 'token'
      }
    })
    .then(function() {
      expect(true).toEqual(false);
    })
    .catch(function(err) {
      expect(mockWindow.close).toHaveBeenCalled();
      util.expectErrorToEqual(err, {
        name: 'AuthSdkError',
        message: 'OAuth flow timed out',
        errorCode: 'INTERNAL',
        errorSummary: 'OAuth flow timed out',
        errorLink: 'INTERNAL',
        errorId: 'INTERNAL',
        errorCauses: []
      });
    });
    return Promise.resolve()
      .then(function() {
        jest.runAllTicks(); // resolve pending promises
        jest.advanceTimersByTime(timeoutMs); // should trigger timeout
        return promise;
      });
  });
  it('promise will reject if popup is blocked', function() {
    jest.spyOn(window, 'open').mockImplementation(function () {
      return null; // null window is returned
    });
    jest.useFakeTimers();

    var promise = oauthUtil.setup({
      closePopup: true,
      willFail: true,
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithPopupArgs: {
        responseType: 'token'
      }
    })
    .then(function() {
      expect(true).toEqual(false);
    })
    .catch(function(err) {
      util.expectErrorToEqual(err, {
        name: 'AuthSdkError',
        message: 'Unable to parse OAuth flow response',
        errorCode: 'INTERNAL',
        errorSummary: 'Unable to parse OAuth flow response',
        errorLink: 'INTERNAL',
        errorId: 'INTERNAL',
        errorCauses: []
      });
    });
    return Promise.resolve()
      .then(function () {
        jest.runAllTimers();
        return promise;
      });
  });

  it('returns tokens using idp', function() {
      return oauthUtil.setupPopup({
        oktaAuthArgs: {
          pkce: false,
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
            'response_type': 'token id_token',
            'response_mode': 'okta_post_message',
            'display': 'popup',
            'state': oauthUtil.mockedState,
            'nonce': oauthUtil.mockedNonce,
            'scope': 'openid email',
            'idp': 'testIdp'
          }
        }
      });
  });

  it('returns tokens using idp with authorization server', function() {
      return oauthUtil.setupPopup({
        oktaAuthArgs: {
          pkce: false,
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
            'response_type': 'token id_token',
            'response_mode': 'okta_post_message',
            'display': 'popup',
            'state': oauthUtil.mockedState,
            'nonce': oauthUtil.mockedNonce,
            'scope': 'openid email',
            'idp': 'testIdp'
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

  it('allows passing issuer through getWithPopup, which takes precedence', function() {
      return oauthUtil.setupPopup({
        oktaAuthArgs: {
          pkce: false,
          issuer: 'https://auth-js-test.okta.com/oauth2/ORIGINAL_AUTH_SERVER_ID',
          clientId: 'NPSfOkH5eZrTy8PMDlvx',
          redirectUri: 'https://example.com/redirect'
        },
        getWithPopupArgs: [{
          idp: 'testIdp',
          issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7'
        }],
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

  it('does not allow multiple popups simultaneously', function() {
    var firstPopup;
    var secondPopup;

    // mock popup creation
    var popups = [];
    function getOpenPopups() {
      return popups.filter(function(popup) {
        return !popup.closed;
      });
    }

    return oauthUtil.setupSimultaneousPostMessage()
    .then(function(context) {

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
      firstPopup = context.client.token.getWithPopup({
        idp: 'testIdp',
        responseType: 'id_token',
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce
      });

      // getWithPopup, but don't resolve
      secondPopup = context.client.token.getWithPopup({
        idp: 'testIdp2',
        responseType: 'id_token',
        state: oauthUtil.mockedState2,
        nonce: oauthUtil.mockedNonce2
      });
      return waitFor(() => {
        return popups.length > 0 ? context : false;
      });
    }).then(context => {

      // assert that only one popup is open
      expect(getOpenPopups().length).toBe(1);

      // resolve the first popup
      context.emitter.emit('trigger', oauthUtil.mockedState);
      return firstPopup.then(val => {
        expect(val.tokens.idToken).toEqual(tokens.standardIdTokenParsed);
        expect(popups[0].closed).toBe(true); // first popup should be closed
        expect(popups.length).toBe(1); // 2nd popup is not open yet
        return waitFor(() => {
          return getOpenPopups().length > 0 ? context : false;
        });
      });
    }).then(context => {
      // assert that only one popup is open
      expect(getOpenPopups().length).toBe(1);

      // resolve the 2nd popup
      context.emitter.emit('trigger', oauthUtil.mockedState2);

      return secondPopup
      .then(function(val) {
        expect(val.tokens.idToken).toEqual(tokens.standardIdToken2Parsed);
        expect(popups[1].closed).toBe(true); // 2nd popup should be closed
        expect(popups.length).toBe(2); // no other popups were created
      });
    });
  });

  it('returns access_token using sessionToken', function() {
    return oauthUtil.setupPopup({
      oktaAuthArgs: {
        pkce: false,
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
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          idToken: tokens.standardAccessTokenParsed
        }
      }
    });
  });

  it('returns access_token using idp with authorization server', function() {
    return oauthUtil.setupPopup({
      oktaAuthArgs: {
        pkce: false,
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
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          idToken: tokens.authServerAccessTokenParsed
        }
      }
    });
  });

  it('returns access_token and id_token using idp with authorization server', function() {
    return oauthUtil.setupPopup({
      oktaAuthArgs: {
        pkce: false,
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
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          idToken: tokens.authServerIdTokenParsed,
          accessToken: tokens.authServerAccessTokenParsed
        }
      }
    });
  });

  it('returns access_token and id_token using idp', function() {
    return oauthUtil.setupPopup({
      oktaAuthArgs: {
        pkce: false,
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
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          idToken: tokens.standardIdTokenParsed,
          accessToken: tokens.standardAccessTokenParsed
        }
      }
    });
  });

  it('should throw AuthSdkError when in callback state', async () => {
    delete global.window.location;
    global.window.location = {
      protocol: 'https:',
      hostname: 'somesite.local',
      search: '?code=fakecode'
    };
    const client = new OktaAuth({
      pkce: true,
      issuer: 'https://auth-js-test.okta.com',
      clientId: 'foo'
    });

    try {
      await client.token.getWithPopup();
    } catch (err) {
      expect(err).toBeInstanceOf(AuthSdkError);
      expect(err.message).toBe('The app should not attempt to call getToken on callback. Authorize flow is already in process. Use parseFromUrl() to receive tokens.');
    }
  });

});

// eslint-disable-next-line max-statements
describe('token.getWithRedirect', function() {
  var codeChallengeMethod = 'S256';
  var codeChallenge = 'fake';
  var defaultUrls;
  var customUrls;
  var nonceCookie;
  var stateCookie;
  var originalLocation;

  afterEach(() => {
    global.window.location = originalLocation;
  });

  beforeEach(function() {
    // mock window.location so we appear to be on an HTTPS origin
    originalLocation = global.window.location;
    delete global.window.location;
    global.window.location = {
      protocol: 'https:',
      hostname: 'somesite.local'
    };

    defaultUrls = {
      issuer: 'https://auth-js-test.okta.com',
      authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
      userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo',
      tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
      revokeUrl: 'https://auth-js-test.okta.com/oauth2/v1/revoke',
      logoutUrl: 'https://auth-js-test.okta.com/oauth2/v1/logout',
    };
    customUrls = {
      issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
      authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
      userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo',
      tokenUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/token',
      revokeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/revoke',
      logoutUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/logout',
    };
    nonceCookie = [
      'okta-oauth-nonce',
      oauthUtil.mockedNonce,
      null, // expiresAt
      secureCookieSettings
    ];

    stateCookie =  [
      'okta-oauth-state',
      oauthUtil.mockedState,
      null, // expiresAt
      secureCookieSettings
    ];
  });
  
  afterEach(() => {
    window.location = originalLocation;
  });

  function mockPKCE() {
    spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
    spyOn(sdkUtil, 'getWellKnown').and.returnValue(Promise.resolve({
      'code_challenge_methods_supported': [codeChallengeMethod]
    }));
    spyOn(pkce, 'generateVerifier');
    spyOn(pkce, 'saveMeta');
    spyOn(pkce, 'computeChallenge').and.returnValue(Promise.resolve(codeChallenge));
  }
  it('Uses insecure cookie settings if running on http://localhost', function() {
    delete window.location;
    window.location = {
      protocol: 'http:',
      hostname: 'localhost'
    };
    return oauthUtil.setupRedirect({
      getWithRedirectArgs: {},
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: ['token', 'id_token'],
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, 
          insecureCookieSettings
        ],
        [
          'okta-oauth-nonce',
          oauthUtil.mockedNonce,
          null, // expiresAt
          insecureCookieSettings
        ],
        [
          'okta-oauth-state',
          oauthUtil.mockedState,
          null, // expiresAt
          insecureCookieSettings
        ]
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('If extra options are passed, promise will reject', function() {
    return oauthUtil.setupRedirect({
      willFail: true,
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
      },
      getWithRedirectArgs: [{
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
        message: 'As of version 3.0, "getWithRedirect" takes only a single set of options',
        errorCode: 'INTERNAL',
        errorSummary: 'As of version 3.0, "getWithRedirect" takes only a single set of options',
        errorLink: 'INTERNAL',
        errorId: 'INTERNAL',
        errorCauses: []
      });
    });
  });

  it('PKCE: Can pass responseMode=fragment', function() {
    mockPKCE();
    return oauthUtil.setupRedirect({
      oktaAuthArgs: {
        pkce: true
      },
      getWithRedirectArgs: {
        responseMode: 'fragment',
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
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'code_challenge=' + codeChallenge + '&' +
                            'code_challenge_method=' + codeChallengeMethod + '&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_mode=fragment&' +
                            'response_type=code&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('PKCE: Can set responseMode=fragment on SDK instance', function() {
    mockPKCE();
    return oauthUtil.setupRedirect({
      oktaAuthArgs: {
        pkce: true,
        responseMode: 'fragment'
      },
      getWithRedirectArgs: {},
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'code',
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'code_challenge=' + codeChallenge + '&' +
                            'code_challenge_method=' + codeChallengeMethod + '&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_mode=fragment&' +
                            'response_type=code&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url and cookie using sessionToken', function() {
    return oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        sessionToken: 'testToken'
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
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url and cookie using sessionToken and authorization server', function() {
    return oauthUtil.setupRedirect({
      oktaAuthArgs: {
        pkce: false,
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
            responseType: ['token', 'id_token'],
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: customUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('allows passing issuer through getWithRedirect, which takes precedence', function() {
    return oauthUtil.setupRedirect({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com/oauth2/ORIGINAL_AUTH_SERVER_ID',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithRedirectArgs: [{
        responseType: 'token',
        scopes: ['email'],
        sessionToken: 'testToken',
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
            urls: customUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=email'
    });
  });

  it('sets authorize url for access_token and don\'t throw an error if openid isn\'t included in scope', function() {
    return oauthUtil.setupRedirect({
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
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=email'
    });
  });

  it('sets authorize url and cookie for access_token using sessionToken and authorization server', function() {
    return oauthUtil.setupRedirect({
      oktaAuthArgs: {
        pkce: false,
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
            urls: customUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=email'
    });
  });

  it('sets authorize url for access_token and id_token using idp', function() {
    return oauthUtil.setupRedirect({
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
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'idp=testIdp&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url for access_token and id_token using idp and authorization server', function() {
    return oauthUtil.setupRedirect({
      oktaAuthArgs: {
        pkce: false,
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
            urls: customUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'idp=testIdp&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url for authorization code requests', function() {
    return oauthUtil.setupRedirect({
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
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=code&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('PKCE: sets authorize url for authorization code requests', function() {
    mockPKCE();
    return oauthUtil.setupRedirect({
      oktaAuthArgs: {
        pkce: true,
      },
      getWithRedirectArgs: {
        sessionToken: 'testToken',
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
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'code_challenge=' + codeChallenge + '&' +
                            'code_challenge_method=' + codeChallengeMethod + '&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=code&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url for authorization code requests with an authorization server', function() {
    return oauthUtil.setupRedirect({
      oktaAuthArgs: {
        pkce: false,
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
            urls: customUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=code&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url for authorization code (as an array) requests, ' +
    'defaulting responseMode to query', function() {
    return oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        sessionToken: 'testToken',
        responseType: ['code']
      },
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: ['code'],
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=code&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('PKCE: sets authorize url for authorization code (as an array) requests, ' +
  'defaulting responseMode to fragment', function() {
  mockPKCE();
  return oauthUtil.setupRedirect({
    oktaAuthArgs: {
      pkce: true,
    },
    getWithRedirectArgs: {
      sessionToken: 'testToken',
      responseType: ['code']
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
          urls: defaultUrls,
          ignoreSignature: false
        }),
        null,
        secureCookieSettings
      ],
      nonceCookie,
      stateCookie
    ],
    expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                          'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                          'code_challenge=' + codeChallenge + '&' +
                          'code_challenge_method=' + codeChallengeMethod + '&' +
                          'nonce=' + oauthUtil.mockedNonce + '&' +
                          'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                          'response_type=code&' +
                          'sessionToken=testToken&' +
                          'state=' + oauthUtil.mockedState + '&' +
                          'scope=openid%20email'
  });
});

  it('sets authorize url for authorization code requests, allowing form_post responseMode', function() {
    return oauthUtil.setupRedirect({
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
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_mode=form_post&' +
                            'response_type=code&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('passes optional login_hint query param through', function() {
    return oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        loginHint: 'JoeUser',
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
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'login_hint=JoeUser&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('passes optional idp_scope query param through when given a string', function() {
    return oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        idpScope: 'scope1 scope2',
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
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'idp_scope=scope1%20scope2&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('passes optional idp_scope query param through when given an array of strings', function() {
    return oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        idpScope: ['scope1', 'scope2'],
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
            urls: defaultUrls,
            ignoreSignature: false
          }),
        null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'idp_scope=scope1%20scope2&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('should throw AuthSdkError when in callback state', async () => {
    delete global.window.location;
    global.window.location = {
      protocol: 'https:',
      hostname: 'somesite.local',
      search: '?code=fakecode'
    };
    const client = new OktaAuth({
      pkce: true,
      issuer: 'https://auth-js-test.okta.com',
      clientId: 'foo'
    });

    try {
      await client.token.getWithRedirect();
    } catch (err) {
      expect(err).toBeInstanceOf(AuthSdkError);
      expect(err.message).toBe('The app should not attempt to call getToken on callback. Authorize flow is already in process. Use parseFromUrl() to receive tokens.');
    }
  });

});

describe('token.parseFromUrl', function() {
  function mockPKCE(response) {
    var codeVerifier = 'fake';
    var redirectUri = 'https://example.com/redirect';
  
    spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
    spyOn(pkce, 'loadMeta').and.returnValue({
      codeVerifier,
      redirectUri
    });
    spyOn(pkce, 'clearMeta');
    spyOn(pkce, 'getToken').and.returnValue(Promise.resolve(response));
  }

  it('authorization_code: Will return code', function() {
    return oauthUtil.setupParseUrl({
      oktaAuthArgs: {
        pkce: false,
        responseMode: 'query',
        responseType: ['code']
      },
      searchMock: '?code=fake' +
      '&state=' + oauthUtil.mockedState,
      oauthParams: JSON.stringify({
        responseType: ['code'],
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }),
      expectedResp: {
        code: 'fake',
        state: oauthUtil.mockedState,
        tokens: {}
      }
    });
  });

  it('does not change the hash if a url is passed directly', function() {
    return oauthUtil.setupParseUrl({
      parseFromUrlArgs: 'http://example.com#id_token=' + tokens.standardIdToken +
        '&access_token=' + tokens.standardAccessToken +
        '&state=' + oauthUtil.mockedState,
      oauthParams: JSON.stringify({
        responseType: ['token', 'id_token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }),
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.standardAccessTokenParsed,
          idToken: tokens.standardIdTokenParsed
        }
      }
    });
  });

  it('does not change the hash if a url is passed as an option', function() {
    return oauthUtil.setupParseUrl({
      parseFromUrlArgs: {
        url: 'http://example.com#id_token=' + tokens.standardIdToken +
          '&access_token=' + tokens.standardAccessToken +    
          '&state=' + oauthUtil.mockedState,
      },
      oauthParams: JSON.stringify({
        responseType: ['token', 'id_token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }),
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.standardAccessTokenParsed,
          idToken: tokens.standardIdTokenParsed
        }
      }
    });
  });

  it('PKCE: can parse code in query', function() {
    mockPKCE({
      id_token: tokens.standardIdToken,
      access_token: tokens.standardAccessToken
    });
    return oauthUtil.setupParseUrl({
      oktaAuthArgs: {
        pkce: true
      },
      searchMock: '?code=fake' + 
        '&state=' + oauthUtil.mockedState,
      oauthParams: JSON.stringify({
        responseType: ['token', 'id_token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }),
      expectedResp: {
        code: 'fake',
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.standardAccessTokenParsed,
          idToken: tokens.standardIdTokenParsed
        }
      }
    });
  });

  it('PKCE: can pass responseMode=fragment in options', function() {
    mockPKCE({
      id_token: tokens.standardIdToken,
      access_token: tokens.standardAccessToken
    });
    return oauthUtil.setupParseUrl({
      oktaAuthArgs: {
        pkce: true
      },
      parseFromUrlArgs: {
        responseMode: 'fragment'
      },
      hashMock: '#code=fake' + 
        '&state=' + oauthUtil.mockedState,
      oauthParams: JSON.stringify({
        responseType: ['token', 'id_token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }),
      expectedResp: {
        code: 'fake',
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.standardAccessTokenParsed,
          idToken: tokens.standardIdTokenParsed
        }
      }
    });
  });

  it('PKCE: Can set responseMode=fragment in SDK options', function() {
    mockPKCE({
      id_token: tokens.standardIdToken,
      access_token: tokens.standardAccessToken
    });
    return oauthUtil.setupParseUrl({
      oktaAuthArgs: {
        pkce: true,
        responseMode: 'fragment'
      },
      hashMock: '#code=fake' +
      '&state=' + oauthUtil.mockedState,
      oauthParams: JSON.stringify({
        responseType: ['token', 'id_token'],
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }),
      expectedResp: {
        code: 'fake',
        state: oauthUtil.mockedState,
        tokens: {
          idToken: {
            idToken: tokens.standardIdToken,
            claims: tokens.standardIdTokenClaims,
            expiresAt: 1449699930,
            scopes: ['openid', 'email']
          }
        }
      }
    });
  });

  it('uses location.hash to remove token if history.replaceState does not exist', function() {
    return oauthUtil.setupParseUrl({
      noHistory: true,
      hashMock: '#id_token=' + tokens.standardIdToken +
                '&state=' + oauthUtil.mockedState,
      oauthParams: JSON.stringify({
        responseType: 'id_token',
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }),
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          idToken: {
            idToken: tokens.standardIdToken,
            claims: tokens.standardIdTokenClaims,
            expiresAt: 1449699930,
            scopes: ['openid', 'email']
          }
        }
      }
    });
  });

  it('parses id_token', function() {
    return oauthUtil.setupParseUrl({
      hashMock: '#id_token=' + tokens.standardIdToken +
                '&state=' + oauthUtil.mockedState,
      oauthParams: JSON.stringify({
        responseType: 'id_token',
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }),
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          idToken: {
            idToken: tokens.standardIdToken,
            claims: tokens.standardIdTokenClaims,
            expiresAt: 1449699930,
            scopes: ['openid', 'email']
          }
        }
      }
    });
  });

  it('parses id_token with authorization server issuer', function() {
    return oauthUtil.setupParseUrl({
      hashMock: '#id_token=' + tokens.authServerIdToken +
                '&state=' + oauthUtil.mockedState,
      oauthParams: JSON.stringify({
        responseType: 'id_token',
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
        }
      }),
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          idToken: tokens.authServerIdTokenParsed
        }
      }
    });
  });

  it('parses access_token', function() {
    return oauthUtil.setupParseUrl({
      time: 1449699929,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthParams: JSON.stringify({
        responseType: 'token',
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }),
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.standardAccessTokenParsed
        }
      }
    });
  });

  it('parses access_token with authorization server issuer', function() {
    return oauthUtil.setupParseUrl({
      time: 1449699929,
      hashMock: '#access_token=' + tokens.authServerAccessToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthParams: JSON.stringify({
        responseType: 'token',
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
        }
      }),
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.authServerAccessTokenParsed
        }
      }
    });
  });

  it('parses access_token and id_token', function() {
    return oauthUtil.setupParseUrl({
      time: 1449699929,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&id_token=' + tokens.standardIdToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthParams: JSON.stringify({
        responseType: ['id_token', 'token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }),
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.standardAccessTokenParsed,
          idToken: tokens.standardIdTokenParsed
        }
      }
    });
  });

  it('parses access_token and id_token with authorization server issuer', function() {
    return oauthUtil.setupParseUrl({
      time: 1449699929,
      hashMock: '#access_token=' + tokens.authServerAccessToken +
                '&id_token=' + tokens.authServerIdToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthParams: JSON.stringify({
        responseType: ['id_token', 'token'],
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
        }
      }),
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.authServerAccessTokenParsed,
          idToken: tokens.authServerIdTokenParsed
        }
      }
    });
  });

  it('throws an error if nothing to parse', () => {
    const error = {
      name: 'AuthSdkError',
      message: 'Unable to parse a token from the url',
      errorCode: 'INTERNAL',
      errorSummary: 'Unable to parse a token from the url',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    };
    return oauthUtil.setupParseUrl({
      willFail: true,
      hashMock: '',
      oauthParams: JSON.stringify({
        responseType: ['id_token', 'token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      })
    })
    .catch(function(e) {
      util.expectErrorToEqual(e, error);
    });

  });

  it('throws an error if no oauth redirect params are set', () => {
    const error = {
      name: 'AuthSdkError',
      message: 'Unable to retrieve OAuth redirect params from storage',
      errorCode: 'INTERNAL',
      errorSummary: 'Unable to retrieve OAuth redirect params from storage',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    };

    return oauthUtil.setupParseUrl({
      willFail: true,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&id_token=' + tokens.standardIdToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthParams: ''
    })
    .catch(function(e) {
      util.expectErrorToEqual(e, error);
    });
  });

  it('throws an error if state doesn\'t match', () => {
    const error = {
      name: 'AuthSdkError',
      message: 'OAuth flow response state doesn\'t match request state',
      errorCode: 'INTERNAL',
      errorSummary: 'OAuth flow response state doesn\'t match request state',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    };

    return oauthUtil.setupParseUrl({
      willFail: true,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&id_token=' + tokens.standardIdToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthParams: JSON.stringify({
        responseType: ['id_token', 'token'],
        state: 'mismatchedState',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      })
    })
    .catch(function(e) {
      util.expectErrorToEqual(e, error);
    });
  });

  it('throws an error if nonce doesn\'t match', () => {
    const error = {
      name: 'AuthSdkError',
      message: 'OAuth flow response nonce doesn\'t match request nonce',
      errorCode: 'INTERNAL',
      errorSummary: 'OAuth flow response nonce doesn\'t match request nonce',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    };
    return oauthUtil.setupParseUrl({
      willFail: true,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&id_token=' + tokens.standardIdToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthParams: JSON.stringify({
        responseType: ['id_token', 'token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'mismatchedNonce',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      })
    })
    .catch(function(e) {
      util.expectErrorToEqual(e, error);
    });
  });

  it('throws an error if access_token was not returned', () => {
    const error = {
      name: 'AuthSdkError',
      message: 'Unable to parse OAuth flow response: response type "token" was requested but "access_token" was not returned.',
      errorCode: 'INTERNAL',
      errorSummary: 'Unable to parse OAuth flow response: response type "token" was requested but "access_token" was not returned.',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    };
    return oauthUtil.setupParseUrl({
      willFail: true,
      hashMock: '#id_token=' + tokens.standardIdToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthParams: JSON.stringify({
        responseType: ['id_token', 'token'],
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      })
    })
    .catch(function(e) {
      util.expectErrorToEqual(e, error);
    });
  });

  it('throws an error if id_token was not returned', () => {
    const error = {
      name: 'AuthSdkError',
      message: 'Unable to parse OAuth flow response: response type "id_token" was requested but "id_token" was not returned.',
      errorCode: 'INTERNAL',
      errorSummary: 'Unable to parse OAuth flow response: response type "id_token" was requested but "id_token" was not returned.',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    };
    return oauthUtil.setupParseUrl({
      willFail: true,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      oauthParams: JSON.stringify({
        responseType: ['id_token', 'token'],
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      })
    })
    .catch(function(e) {
      util.expectErrorToEqual(e, error);
    });
  });
});

describe('token.renew', function() {
  it('returns id_token', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
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
      },
      expectedResp: tokens.standardIdTokenParsed
    });
  });

  it('returns id_token with authorization server', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
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
      expectedResp: tokens.authServerIdTokenParsed
    });
  });

  it('returns access_token', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
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
      expectedResp: tokens.standardAccessTokenParsed
    });
  });

  it('returns access_token with authorization server', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
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
        'access_token': tokens.authServerAccessToken,
        'token_type': 'Bearer',
        'expires_in': 3600,
        'state': oauthUtil.mockedState
      },
      expectedResp: tokens.authServerAccessTokenParsed
    });
  });

  it('throws an error if a non-token is passed', () => {
    const error = {
      name: 'AuthSdkError',
      message: 'Renew must be passed a token with an array of scopes and an accessToken or idToken',
      errorCode: 'INTERNAL',
      errorSummary: 'Renew must be passed a token with an array of scopes and an accessToken or idToken',
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
      tokenRenewArgs: [{non:'token'}]
    })
    .catch(function(e) {
      util.expectErrorToEqual(e, error);
    });
  });
});

describe('token.renewTokens', function() {
  it('should return tokens', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      tokenRenewTokensArgs: [],
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
          'prompt': 'none'
        }
      },
      time: 1449699929,
      postMessageResp: {
        'id_token': tokens.standardIdToken,
        'access_token': tokens.standardAccessToken,
        'expires_in': 3600,
        'token_type': 'Bearer',
        'state': oauthUtil.mockedState
      },
      validateFunc: ({ accessToken, idToken }) => {
        oauthUtil.validateResponse(accessToken, tokens.standardAccessTokenParsed);
        oauthUtil.validateResponse(idToken, tokens.standardIdTokenParsed);
      }
    });
  });

  it('should return tokens with authorization server', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      tokenRenewTokensArgs: [],
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
          'prompt': 'none'
        }
      },
      time: 1449699929,
      postMessageResp: {
        'id_token': tokens.authServerIdToken,
        'access_token': tokens.authServerAccessToken,
        'expires_in': 3600,
        'token_type': 'Bearer',
        'state': oauthUtil.mockedState
      },
      validateFunc: (res) => {
        oauthUtil.validateResponse(res.accessToken, tokens.authServerAccessTokenParsed);
        oauthUtil.validateResponse(res.idToken, tokens.authServerIdTokenParsed);
      }
    });
  });

  it('should accept tokenParams options', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      tokenRenewTokensArgs: [{ scopes: ['openid', 'email', 'profile'] }],
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'token id_token',
          'response_mode': 'okta_post_message',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email profile',
          'prompt': 'none'
        }
      },
      time: 1449699929,
      postMessageResp: {
        'id_token': tokens.standardIdToken,
        'access_token': tokens.standardAccessToken,
        'expires_in': 3600,
        'token_type': 'Bearer',
        'state': oauthUtil.mockedState
      },
      validateFunc: ({ accessToken, idToken }) => {
        oauthUtil.validateResponse(accessToken, tokens.standardAccessTokenParsed);
        oauthUtil.validateResponse(idToken, tokens.standardIdTokenParsed);
      }
    });
  });
});

describe('token.getUserInfo', function() {
  let responseXHR;
  beforeEach(() => {
    responseXHR = _.cloneDeep(require('@okta/test.support/xhr/userinfo'));
    responseXHR.response.sub = tokens.standardIdTokenParsed.claims.sub;
  });

  util.itMakesCorrectRequestResponse({
    title: 'allows retrieving UserInfo with accessTokenObject and idTokenObject',
    setup: () => {
      return {
        request: {
          uri: '/oauth2/v1/userinfo',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'okta-auth-js/' + packageJson.version,
            'Authorization': 'Bearer ' + tokens.standardAccessToken
          }
        },
        response: responseXHR
      };
    },
    execute: function(test) {
      return test.oa.token.getUserInfo(tokens.standardAccessTokenParsed, tokens.standardIdTokenParsed);
    },
    expectations: function(test, res) {
      expect(res).toEqual(responseXHR.response);
    }
  });


  util.itMakesCorrectRequestResponse({
    title: 'allows retrieving UserInfo with no arguments if valid tokens exist in token manager',
    setup: () => {
      return {
        request: {
          uri: '/oauth2/v1/userinfo',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'okta-auth-js/' + packageJson.version,
            'Authorization': 'Bearer ' + tokens.standardAccessToken
          }
        },
        response: responseXHR
      };
    },
    execute: function(test) {
      util.warpToUnixTime(oauthUtil.getTime());
      test.oa.tokenManager.add('accessToken', tokens.standardAccessTokenParsed);
      test.oa.tokenManager.add('idToken', tokens.standardIdTokenParsed);
      return test.oa.token.getUserInfo();
    },
    expectations: function(test, res) {
      expect(res).toEqual(responseXHR.response);
    }
  });

  util.itMakesCorrectRequestResponse({
    title: 'allows retrieving UserInfo using authorization server',
    setup: () => {
      responseXHR.response.sub = tokens.authServerIdTokenParsed.claims.sub;
      return {
        request: {
          uri: '/oauth2/aus8aus76q8iphupD0h7/v1/userinfo',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'okta-auth-js/' + packageJson.version,
            'Authorization': 'Bearer ' + tokens.authServerAccessToken
          }
        },
        response: responseXHR
      };
    },
    execute: function(test) {
      return test.oa.token.getUserInfo(tokens.authServerAccessTokenParsed, tokens.authServerIdTokenParsed);
    },
    expectations: function(test, res) {
      expect(res).toEqual(responseXHR.response);
    }
  });

  it('throws an error if no arguments are passed', function() {
    return Promise.resolve(setupSync())
    .then(function(oa) {
      jest.spyOn(oa.tokenManager, 'get').mockReturnValue(Promise.resolve());
      return oa.token.getUserInfo();
    })
    .then(function() {
      expect('not to be hit').toBe(true);
    })
    .catch(function(err) {
      expect(err.name).toEqual('AuthSdkError');
      expect(err.errorSummary).toBe('getUserInfo requires an access token object');
    });
  });

  it('throws an error if a string is passed instead of an accessToken object', function() {
    return Promise.resolve(setupSync())
    .then(function(oa) {
      jest.spyOn(oa.tokenManager, 'get').mockReturnValue(Promise.resolve());
      return oa.token.getUserInfo('just a string');
    })
    .then(function() {
      expect('not to be hit').toBe(true);
    })
    .catch(function(err) {
      expect(err.name).toEqual('AuthSdkError');
      expect(err.errorSummary).toBe('getUserInfo requires an access token object');
    });
  });

  it('throws an error if no idTokenObject is passed', function() {
    return Promise.resolve(setupSync())
    .then(function(oa) {
      jest.spyOn(oa.tokenManager, 'get').mockReturnValue(Promise.resolve());
      return oa.token.getUserInfo(tokens.standardAccessTokenParsed);
    })
    .then(function() {
      expect('not to be hit').toBe(true);
    })
    .catch(function(err) {
      expect(err.name).toEqual('AuthSdkError');
      expect(err.errorSummary).toBe('getUserInfo requires an ID token object');
    });
  });

  it('throws an error if a string is passed instead of an idTokenObject', function() {
    return Promise.resolve(setupSync())
    .then(function(oa) {
      jest.spyOn(oa.tokenManager, 'get').mockReturnValue(Promise.resolve());
      return oa.token.getUserInfo(tokens.standardAccessTokenParsed, 'some string');
    })
    .then(function() {
      expect('not to be hit').toBe(true);
    })
    .catch(function(err) {
      expect(err.name).toEqual('AuthSdkError');
      expect(err.errorSummary).toBe('getUserInfo requires an ID token object');
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
          'X-Okta-User-Agent-Extended': 'okta-auth-js/' + packageJson.version,
          'Authorization': 'Bearer ' + tokens.standardAccessToken
        }
      },
      response: 'error-userinfo-insufficient-scope'
    },
    execute: function(test) {
      return test.oa.token.getUserInfo(tokens.standardAccessTokenParsed, tokens.standardIdTokenParsed);
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
          'X-Okta-User-Agent-Extended': 'okta-auth-js/' + packageJson.version,
          'Authorization': 'Bearer ' + tokens.standardAccessToken
        }
      },
      response: 'error-userinfo-invalid-token'
    },
    execute: function(test) {
      return test.oa.token.getUserInfo(tokens.standardAccessTokenParsed, tokens.standardIdTokenParsed);
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
  var validationParams;
  var client;
  beforeEach(() => {
    validationParams = {
      clientId: tokens.standardIdTokenParsed.clientId,
      issuer: tokens.standardIdTokenParsed.issuer
    };
    client = setupSync();
  });

  describe('with access token', () => {
    var idToken;
    var atHash;

    beforeEach(() => {
      atHash = 'Gryuqew1_irUBmgZAncMsA'; // based on tokens.standardAccessToken

      // Mock out sdk crypto
      jest.spyOn(client.features, 'isTokenVerifySupported').mockReturnValue(true);
      jest.spyOn(sdkCrypto, 'verifyToken').mockReturnValue(true);
      jest.spyOn(sdkCrypto, 'getOidcHash').mockReturnValue(Promise.resolve(atHash));

      // Return modified idToken
      idToken = _.cloneDeep(tokens.standardIdTokenParsed);
      idToken.claims.at_hash = atHash;
    });

    it('verifies idToken at_hash claim against accessToken', () => {
      util.warpToUnixTime(1449699929);
      oauthUtil.loadWellKnownAndKeysCache();
      validationParams.accessToken = tokens.standardAccessToken;
      return client.token.verify(idToken, validationParams)
      .then(function(res) {
        expect(res).toEqual(idToken);
        expect(sdkCrypto.getOidcHash).toHaveBeenCalledWith(tokens.standardAccessToken);
      });
    });

    it('throws if idToken at_hash claim does not match accessToken', () => {
      util.warpToUnixTime(1449699929);
      oauthUtil.loadWellKnownAndKeysCache();
      validationParams.accessToken = tokens.standardAccessToken;
      idToken.claims.at_hash = 'other_hash';
      return client.token.verify(idToken, validationParams)
      .then(function() {
        expect('not to be hit').toEqual(true);
      })
      .catch(function(err) {
        util.assertAuthSdkError(err, 'Token hash verification failed');
      });
    });

    it('skips verification if idToken does not have at_hash claim', () => {
      util.warpToUnixTime(1449699929);
      oauthUtil.loadWellKnownAndKeysCache();
      validationParams.accessToken = tokens.standardAccessToken;
      delete idToken.claims.at_hash;
      return client.token.verify(idToken, validationParams)
      .then(function(res) {
        expect(res).toEqual(idToken);
        expect(sdkCrypto.getOidcHash).not.toHaveBeenCalled();
      });
    });
  });

  it('verifies a valid idToken with nonce', function() {
    util.warpToUnixTime(1449699929);
    oauthUtil.loadWellKnownAndKeysCache();
    validationParams.nonce = tokens.standardIdTokenParsed.nonce;
    return client.token.verify(tokens.standardIdTokenParsed, validationParams)
    .then(function(res) {
      expect(res).toEqual(tokens.standardIdTokenParsed);
    });
  });
  it('verifies a valid idToken without nonce or accessToken', function() {
    util.warpToUnixTime(1449699929);
    oauthUtil.loadWellKnownAndKeysCache();
    return client.token.verify(tokens.standardIdTokenParsed, validationParams)
    .then(function(res) {
      expect(res).toEqual(tokens.standardIdTokenParsed);
    });
  });
  it('validationParams are optional', () => {
    util.warpToUnixTime(1449699929);
    oauthUtil.loadWellKnownAndKeysCache();
    client = setupSync({
      issuer: tokens.standardIdTokenParsed.issuer,
      clientId: tokens.standardIdTokenParsed.clientId,
    });
    return client.token.verify(tokens.standardIdTokenParsed, undefined)
    .then(function(res) {
      expect(res).toEqual(tokens.standardIdTokenParsed);
    });
  });

  describe('rejects a token', function() {
    beforeEach(function() {
      jest.useFakeTimers();
    });
    afterEach(function() {
      jest.useRealTimers();
    });
    function expectError(verifyArgs, message) {
      return client.token.verify.apply(null, verifyArgs)
      .then(function() {
        expect('not to be hit').toEqual(true);
      })
      .catch(function(err) {
        util.assertAuthSdkError(err, message);
      });
    }

    it('isn\'t an idToken', function() {
      return expectError([tokens.standardAccessTokenParsed],
        'Only idTokens may be verified');
    });
    it('issued in the future', function() {
      util.warpToDistantPast();
      return expectError([tokens.standardIdTokenParsed, validationParams],
        'The JWT was issued in the future');
    });
    it('expired', function() {
      util.warpToDistantFuture();
      return expectError([tokens.standardIdTokenParsed, validationParams],
        'The JWT expired and is no longer valid');
    });
    it('invalid nonce', function() {
      validationParams.nonce = 'invalidNonce';
      return expectError([tokens.standardIdToken2Parsed, validationParams],
        'OAuth flow response nonce doesn\'t match request nonce');
    });
    it('invalid audience', function() {
      validationParams.clientId = 'invalidAudience';
      return expectError([tokens.standardIdTokenParsed, validationParams],
        'The audience [NPSfOkH5eZrTy8PMDlvx] does not match [invalidAudience]');
    });
    it('invalid issuer', function() {
      validationParams.issuer = 'http://invalidissuer.example.com';
      return expectError([tokens.standardIdTokenParsed, validationParams],
        'The issuer [https://auth-js-test.okta.com] does not match [http://invalidissuer.example.com]');
    });
    it('expired before issued', function() {
      return expectError([tokens.expiredBeforeIssuedIdTokenParsed, validationParams],
        'The JWT expired before it was issued');
    });
  });
});
