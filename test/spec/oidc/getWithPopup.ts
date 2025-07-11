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


/* global window */

// mock OAuth util
const generateState = jest.fn();
jest.mock('../../../lib/oidc/util/oauth', () => {
  const { generateNonce, getOAuthUrls } = jest.requireActual('../../../lib/oidc/util/oauth');
  return { generateState, generateNonce, getOAuthUrls };
});

import tokens from '@okta/test.support/tokens';
import util from '@okta/test.support/util';
import oauthUtil from '@okta/test.support/oauthUtil';
import waitFor from '@okta/test.support/waitFor';

describe('token.getWithPopup', function() {
  beforeEach(() => {
    generateState.mockReturnValue(oauthUtil.mockedState);
  });
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
    var timeoutMs = 120001;
    var mockWindow = {
      closed: false,
      close: jest.fn(),
      location: {
        assign: jest.fn().mockImplementation(() => {
          jest.runAllTicks(); // resolve pending promises
          jest.advanceTimersByTime(timeoutMs); // should trigger timeout
        })
      }
    };
    jest.spyOn(window, 'open').mockImplementation(function () {
      return mockWindow as unknown as Window; // valid window is returned
    });
    jest.useFakeTimers();
    return oauthUtil.setup({
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
  });
  it('promise will reject if popup is blocked', function() {
    jest.spyOn(window, 'open').mockImplementation(function () {
      return null; // null window is returned
    });

    return oauthUtil.setup({
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
      // should fail after 100ms
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

  it('returns tokens using idp with authorization server', async function() {
      await oauthUtil.setupPopup({
        oktaAuthArgs: {
          pkce: false,
          issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
          clientId: 'NPSfOkH5eZrTy8PMDlvx',
          redirectUri: 'https://example.com/redirect'
        },
        getWithPopupArgs: {
          idp: 'testIdp',
          initialPath: '?foo=1'
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
      expect(window.open).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith('?foo=1', expect.any(String), expect.any(String));
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
      return popups.filter(function(popup: Window) {
        return !popup.closed;
      });
    }

    return oauthUtil.setupSimultaneousPostMessage()
    .then(function(context) {

      function FakePopup(this: any) {
        this.closed = false;
        this.close = () => {
          this.closed = true;
        };
        this.location = {
          assign: jest.fn()
        };
      }
      jest.spyOn(window, 'open').mockImplementation(function() {
        var popup = new FakePopup();
        popups.push(popup as never);
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
        expect((popups[0] as Window).closed).toBe(true); // first popup should be closed
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
        expect((popups[1] as Window).closed).toBe(true); // 2nd popup should be closed
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

});
