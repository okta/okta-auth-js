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


/* global window, document, Storage */
/* eslint-disable complexity, max-statements */
var URL = require('url').URL;
import util from '@okta/test.support/jest/util';
import { OktaAuth } from '@okta/okta-auth-js';
import tokens from './tokens';
import EventEmitter from 'tiny-emitter';
var wellKnown = require('./xhr/well-known');
var wellKnownSharedResource = require('./xhr/well-known-shared-resource');
var keys = require('./xhr/keys');
import storageUtil from '../../lib/browser/browserStorage';
import { isAccessToken, isIDToken } from '../../lib/types';

var oauthUtil = {};

// These are the result of the state and nonce after mocking
oauthUtil.mockedState = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
oauthUtil.mockedNonce = oauthUtil.mockedState;

oauthUtil.mockedState2 = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
oauthUtil.mockedNonce2 = oauthUtil.mockedState2;

oauthUtil.mockStateAndNonce = function() {
  // Make sure the state is generated the same every time (standardState, standardNonce)
  jest.spyOn(Math, 'random').mockReturnValue(0);
};

oauthUtil.mockLocalStorageError = function() {
  jest.spyOn(storageUtil, 'getLocalStorage').mockImplementation(function() {
    throw new Error('This function is not supported on this system.');
  });
};

oauthUtil.mockStorageSetItemError = function() {
  jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(function() {
    throw new Error('This function is not supported on this system.');
  });
};

oauthUtil.mockSessionStorageError = function() {
  jest.spyOn(storageUtil, 'getSessionStorage').mockImplementation(function() {
    throw new Error('This function is not supported on this system.');
  });
};

oauthUtil.getResponseForUrl = function(url, options) {
  options = Object.assign({
    wellKnownSharedResource,
    wellKnown,
    keys
  }, options);
  if (url.match(/.*\/oauth2\/.*\/\.well-known\/openid-configuration$/)) {
    return options.wellKnownSharedResource.response;
  }

  if (url.match(/.*\.well-known\/openid-configuration$/)) {
    return options.wellKnown.response;
  }

  if (url.match(/.*\/v1\/keys$/)) {
    return options.keys.response;
  }
};

oauthUtil.loadWellKnownAndKeysCache = function(authClient, overrideResponses) {
  // mock responses to /.well-known/openid-configuration and /oauth2/v1/keys
  const origMethod = authClient.options.httpRequestClient;
  jest.spyOn(authClient.options, 'httpRequestClient').mockImplementation(async (method, url, options) => {
    const response = oauthUtil.getResponseForUrl(url, overrideResponses);
    if (response) {
      return {
        responseText: JSON.stringify(response)
      };
    }
    return origMethod.apply(this, [method, url, options]);
  });
};

var defaultPostMessage = oauthUtil.defaultPostMessage = {
  'id_token': tokens.standardIdToken,
  'access_token': tokens.standardAccessToken,
  state: oauthUtil.mockedState
};

var defaultResponse = {
  state: oauthUtil.mockedState,
  tokens: {
    accessToken: {
      value: tokens.standardAccessToken,
      accessToken: tokens.standardAccessToken
    },
    idToken: {
      value: tokens.standardIdToken,
      idToken: tokens.standardIdToken,
      claims: tokens.standardIdTokenClaims,
      expiresAt: 1449699930,
      scopes: ['openid', 'email']
    }
  }
};

var getTime = oauthUtil.getTime = function getTime(time) {
  if (time || time === 0) {
    return time;
  } else {
    return tokens.standardIdTokenClaims['auth_time'];
  }
};

function validateResponse(res, expectedResp) {
  function expectResponsesToEqual(actual, expected) {
    if (!actual || !expected) {
      expect(actual).toEqual(expected);
      return;
    }
    expect(actual.idToken).toEqual(expected.idToken);
    expect(actual.claims).toEqual(expected.claims);
    expect(actual.accessToken).toEqual(expected.accessToken);
    expect(actual.expiresAt).toEqual(expected.expiresAt);
    expect(actual.tokenType).toEqual(expected.tokenType);
    expect(actual.code).toEqual(expected.code);
    expect(actual.state).toEqual(expected.state);
  }

  if (Array.isArray(expectedResp)) {
    expect(res.length).toEqual(expectedResp.length);
    var rl = res.length;
    while(rl--) {
      expectResponsesToEqual(res[rl], expectedResp[rl]);
    }
  } else {
    expectResponsesToEqual(res, expectedResp);
  }
}

oauthUtil.validateResponse = validateResponse;

oauthUtil.setup = function(opts) {

  if (opts &&
      (opts.authorizeArgs && opts.authorizeArgs.responseMode !== 'fragment') ||
      opts.getWithoutPromptArgs ||
      opts.getWithPopupArgs ||
      opts.tokenManagerRenewArgs ||
      opts.renewArgs ||
      opts.tokenRenewArgs ||
      opts.tokenRenewTokensArgs ||
      opts.autoRenew) {
    // Simulate the postMessage between the window and the popup or iframe
    jest.spyOn(window, 'addEventListener').mockImplementation(function(eventName, fn) {
      if (eventName === 'message' && !opts.closePopup) {
        var origin = 'https://auth-js-test.okta.com';
        if (opts.postMessageSrc) {
          origin = new URL(opts.postMessageSrc.baseUri).origin;
        } else if (opts.oktaAuthArgs && opts.oktaAuthArgs.url) {
          origin = opts.oktaAuthArgs.url;
        }
        // Call postMessage on the next tick
        setTimeout(function() {
          fn({
            data: opts.postMessageResp || defaultPostMessage,
            origin: origin,
          });
        });
        if (opts.fastForwardToTime) {
          jest.runAllTimers();
        }
      }
    });
  }

  oauthUtil.mockStateAndNonce();

  var authClient;
  if (opts.oktaAuthArgs) {
    authClient = new OktaAuth(opts.oktaAuthArgs);
  } else if (opts.authClient) {
    authClient = opts.authClient;
  } else {
    authClient = new OktaAuth({
      tokenManager: {
        autoRenew: false,
      },
      pkce: false,
      issuer: 'https://auth-js-test.okta.com'
    });
  }

  util.warpToUnixTime(getTime(opts.time));

  // Mock the well-known and keys request
  oauthUtil.loadWellKnownAndKeysCache(authClient);

  if (opts.autoRenew) {
    util.disableLeaderElection();
    util.mockLeader();
    authClient.tokenManager.start();
    authClient.serviceManager.start();
  }

  if (opts.tokenManagerAddKeys) {
    for (var key in opts.tokenManagerAddKeys) {
      if (!Object.prototype.hasOwnProperty.call(opts.tokenManagerAddKeys, key)) {
        continue;
      }
      var token = opts.tokenManagerAddKeys[key];
      authClient.tokenManager.add(key, token);
    }
  }

  var promise;
  if (opts.renewArgs) {
    promise = authClient.token.renew(opts.renewArgs);
  } else if (opts.getWithoutPromptArgs) {
    if (Array.isArray(opts.getWithoutPromptArgs)) {
      promise = authClient.token.getWithoutPrompt.apply(null, opts.getWithoutPromptArgs);
    } else {
      promise = authClient.token.getWithoutPrompt(opts.getWithoutPromptArgs);
    }
  } else if (opts.getWithPopupArgs) {
    if (Array.isArray(opts.getWithPopupArgs)) {
      promise = authClient.token.getWithPopup.apply(null, opts.getWithPopupArgs);
    } else {
      promise = authClient.token.getWithPopup(opts.getWithPopupArgs);
    }
  } else if (opts.tokenManagerRenewArgs) {
    promise = authClient.tokenManager.renew.apply(authClient.tokenManager, opts.tokenManagerRenewArgs);
  } else if (opts.tokenRenewArgs) {
    promise = authClient.token.renew.apply(this, opts.tokenRenewArgs);
  } else if (opts.tokenRenewTokensArgs) {
    promise = authClient.token.renewTokens.apply(this, opts.tokenRenewTokensArgs);
  } else if (opts.autoRenew) {
    const tokenTypesTobeRenewed = opts.tokenTypesTobeRenewed || ['accessToken', 'idToken'];
    promise = new Promise(function(resolve, reject) {
      authClient.tokenManager.on('renewed', function(key, freshToken) {
        if (isAccessToken(freshToken)) {
          const index = tokenTypesTobeRenewed.indexOf('accessToken');
          tokenTypesTobeRenewed.splice(index, 1);
        } else if (isIDToken(freshToken)) {
          const index = tokenTypesTobeRenewed.indexOf('idToken');
          tokenTypesTobeRenewed.splice(index, 1);
        }
        if (!tokenTypesTobeRenewed.length) {
          authClient.tokenManager.clearExpireEventTimeoutAll();
          resolve();
        } 
      });
      authClient.tokenManager.on('error', function(error) {
        reject(error);
      });
    });
  }

  if (opts.fastForwardToTime) {
    util.warpByTicksToUnixTime(opts.time);
  }

  return promise
    .then(function(res) {
      if (opts.willFail) {
        expect('not to be hit').toBe(true);
      }
      if(opts.beforeCompletion) {
        opts.beforeCompletion(authClient);
      }
      if (opts.autoRenew) {
        return;
      }
      var expectedResp = opts.expectedResp || defaultResponse;
      if (opts.validateFunc) {
        opts.validateFunc(res);
      } else {
        validateResponse(res, expectedResp);
      }
    })
    .catch(function(err) {
      if (opts.willFail) {
        throw err;
      } else {
        console.error(err.message); // eslint-disable-line
        expect('not to be hit').toBe(true);
      }
    })
    .finally(function() {
      if (authClient && authClient._tokenQueue) {
        expect(authClient._tokenQueue.queue.length).toBe(0);
      }
      authClient?.tokenManager?.stop();
      authClient?.serviceManager?.stop();
    });
};

oauthUtil.removeAllFrames = function() {
  var iframes = document.getElementsByTagName('IFRAME');
  var il = iframes.length;
  while(il--) {
    var iframe = iframes[il];
    iframe.parentElement.removeChild(iframe);
  }
};

oauthUtil.setupFrame = function(opts) {
  var body = document.getElementsByTagName('body')[0];

  // Make sure no frames carried over from previous tests
  oauthUtil.removeAllFrames();

  // Capture the src of the iframe to check later
  var src;
  var origAppend = body.appendChild;
  jest.spyOn(body, 'appendChild').mockImplementation(function (el) {
    if (el.tagName === 'IFRAME') {
      src = el.src;

      // Remove the src so it doesn't actually load
      el.src = '';

      return origAppend.call(this, el);
    }
    return origAppend.apply(this, arguments);
  });

  function iframeWasCreated() {
    expect(body.appendChild).toHaveBeenCalled();
    var el = body.appendChild.mock.calls[0][0];
    expect(el.tagName).toEqual('IFRAME');
    expect(el.style.display).toEqual('none');
  }

  function iframeWasDestroyed() {
    // All iframes should be created and destroyed in the same test
    var iframes = document.getElementsByTagName('IFRAME');
    expect(iframes.length).toBe(0);

    // Remove any frames that exist, so we don't taint our other tests
    oauthUtil.removeAllFrames();
  }

  return oauthUtil.setup(opts)
    .then(function() {
      iframeWasCreated();
      iframeWasDestroyed();
      if (opts.postMessageSrc) {
        var actual = util.parseUri(src);
        var expected = opts.postMessageSrc;
        expect(actual.baseUri).toEqual(expected.baseUri);
        expect(actual.queryParams).toEqual(expected.queryParams);
      }
    })
    .catch(function(err) {
      iframeWasDestroyed();
      throw err;
    });
};

oauthUtil.setupPopup = function(opts) {
  var src;
  var fakeWindow = {
    location: {
      hash: '',
      assign: function(url) {
        src = url;
      }
    },
    closed: false,
    close: function() {
      this.closed = true;
    }
  };
  jest.spyOn(fakeWindow, 'close');

  jest.spyOn(window, 'open').mockImplementation(function() {
    setTimeout(function() {
      if (opts.closePopup) {
        fakeWindow.close();
      } else {
        fakeWindow.location.hash = opts.changeToHash;
      }
    });
    return fakeWindow;
  });

  function popupWasCreated() {
    expect(window.open).toHaveBeenCalled();
  }

  function popupWasDestroyed() {
    expect(fakeWindow.close).toHaveBeenCalled();
  }

  return oauthUtil.setup(opts)
    .then(function() {
      popupWasCreated();
      popupWasDestroyed();
      if (opts.postMessageSrc) {
        var actual = util.parseUri(src);
        var expected = opts.postMessageSrc;
        expect(actual.baseUri).toEqual(expected.baseUri);
        expect(actual.queryParams).toEqual(expected.queryParams);
      }
    });
};

oauthUtil.setupRedirect = function(opts) {
  var client = new OktaAuth(Object.assign({
    pkce: false,
    issuer: 'https://auth-js-test.okta.com',
    clientId: 'NPSfOkH5eZrTy8PMDlvx',
    redirectUri: 'https://example.com/redirect'
  }, opts.oktaAuthArgs));

  // Mock the well-known and keys request
  oauthUtil.loadWellKnownAndKeysCache(client);

  oauthUtil.mockStateAndNonce();
  var windowLocationMock = util.mockSetWindowLocation(client);
  var setCookieMock = util.mockSetCookie();

  jest.spyOn(storageUtil, 'getSessionStorage')
    .mockImplementation(() => ({
      setItem: jest.fn(),
      getItem: jest.fn()
    }));
  jest.spyOn(storageUtil, 'browserHasSessionStorage')
    .mockImplementation(() => !!opts.hasSessionStorage);

  var promise;
  if (Array.isArray(opts.getWithRedirectArgs)) {
    promise = client.token.getWithRedirect.apply(null, opts.getWithRedirectArgs);
  } else {
    promise = client.token.getWithRedirect(opts.getWithRedirectArgs);
  }

  return promise
    .then(function() {
      expect(windowLocationMock).toHaveBeenCalledWith(opts.expectedRedirectUrl);
      expect(setCookieMock.mock.calls).toEqual(opts.expectedCookies);
    })
    .finally(() => {
      client.transactionManager.clear();
    });
};

oauthUtil.setupParseUrl = function(opts) {
  var client = new OktaAuth(Object.assign({
    pkce: false,
    issuer: 'https://auth-js-test.okta.com',
    clientId: 'NPSfOkH5eZrTy8PMDlvx',
    redirectUri: 'https://example.com/redirect'
  }, opts.oktaAuthArgs));

  // Mock the well-known and keys request
  oauthUtil.loadWellKnownAndKeysCache(client, opts.httpCache);

  util.warpToUnixTime(getTime(opts.time));

  // Mock location
  var mockLocation = {};
  var setLocationHashSpy = jest.fn();
  Object.defineProperty(mockLocation, 'hash', {
    get: function() {
      return typeof opts.hashMock === 'undefined' ? '#test=true' : opts.hashMock;
    },
    set: setLocationHashSpy
  });
  Object.defineProperty(mockLocation, 'pathname', {
    get: function() {
      return '/test/path';
    }
  });
  Object.defineProperty(mockLocation, 'search', {
    get: function() {
      return opts.searchMock || '?test=true';
    }
  });
  util.mockGetLocation(client, mockLocation);

  // Mock document
  util.mockGetDocument(client, {
    title: 'Test'
  });

  // Mock history
  var replaceStateSpy = jest.fn();
  if (opts.noHistory) {
    util.mockGetHistory(client);
  } else {
    util.mockGetHistory(client, {
      replaceState: replaceStateSpy
    });
  }

  util.mockGetCookie(opts.oauthParams);
  var deleteCookieMock = util.mockDeleteCookie();

  jest.spyOn(storageUtil, 'getSessionStorage')
    .mockImplementation(() => ({
      getItem: jest.fn().mockReturnValue(opts.oauthParams || ''),
      removeItem: jest.fn()
    }));
  jest.spyOn(storageUtil, 'browserHasSessionStorage')
    .mockImplementation(() => !!opts.hasSessionStorage);
  
  jest.spyOn(client.transactionManager, 'clear');

  return client.token.parseFromUrl(opts.parseFromUrlArgs)
    .then(function(res) {
      var expectedResp = opts.expectedResp;
      validateResponse(res, expectedResp);

      // The cookie should be deleted
      expect(deleteCookieMock).toHaveBeenCalledWith('okta-oauth-redirect-params');

      if (opts.parseFromUrlArgs && (typeof opts.parseFromUrlArgs === 'string' || opts.parseFromUrlArgs.url)) {
        expect(setLocationHashSpy).not.toHaveBeenCalled();
        expect(replaceStateSpy).not.toHaveBeenCalled();
      } else if (opts.noHistory) {
        expect(setLocationHashSpy).toHaveBeenCalledWith('');
      } else if (opts.searchMock) {
        expect(replaceStateSpy).toHaveBeenCalledWith(null, 'Test', '/test/path#test=true');
      } else {
        expect(replaceStateSpy).toHaveBeenCalledWith(null, 'Test', '/test/path?test=true');
      }
    })
    .finally(() => {
      if (opts.shouldClearTransaction === false) {
        expect(client.transactionManager.clear).not.toHaveBeenCalled();
      } else {
        expect(client.transactionManager.clear).toHaveBeenCalled();
      }
    });
};

oauthUtil.setupSimultaneousPostMessage = function() {
  // Create client
  var client =  new OktaAuth({
    pkce: false,
    issuer: 'https://auth-js-test.okta.com',
    clientId: 'NPSfOkH5eZrTy8PMDlvx',
    redirectUri: 'https://example.com/redirect'
  });

  // Mock the well-known and keys request
  oauthUtil.loadWellKnownAndKeysCache(client);

  var emitter = new EventEmitter();
  jest.spyOn(window, 'addEventListener').mockImplementation(function(eventName, fn) {
    if (eventName === 'message') {
      emitter.on('trigger', function(state) {
        // get the data with the correct state
        var data;
        if (state === oauthUtil.mockedState) {
          data = {
            'id_token': tokens.standardIdToken,
            state: oauthUtil.mockedState
          };
        } else if (state === oauthUtil.mockedState2) {
          data = {
            'id_token': tokens.standardIdToken2,
            state: oauthUtil.mockedState2
          };
        } else {
          throw new Error('Unrecognized state: ' + state);
        }
        fn({
          data: data,
          origin: 'https://auth-js-test.okta.com'
        });
      });
    }
  });

  // warp to time to ensure tokens aren't expired
  util.warpToUnixTime(tokens.standardIdTokenClaims.exp - 1);

  return Promise.resolve({
    client: client,
    emitter: emitter
  });
};

oauthUtil.expectTokenStorageToEqual = function(storage, obj) {
  var parsed = JSON.parse(storage.getItem('okta-token-storage') || '{}');
  expect(parsed).toEqual(obj);
};

export default oauthUtil;
