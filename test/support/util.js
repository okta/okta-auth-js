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


/* eslint-disable max-statements, complexity */
/* global window */
import _ from 'lodash';

import { OktaAuth } from '@okta/okta-auth-js';

import browserStorage from '../../lib/browser/browserStorage';
import { ServiceManager } from '../../lib/ServiceManager';
const cookies = browserStorage.storage;

var util = {};

util.getConsole = function getConsole() {
  return (typeof window === 'undefined') ? global.console : window.console;
};

util.restoreConsole = function restoreConsole(origConsole) {
  if (typeof window === 'undefined') {
    global.console = origConsole;
  } else {
    window.console = origConsole;
  }
};

util.removeConsole = function removeConsole() {
  if (typeof window === 'undefined') {
    global.console = null;
  } else {
    window.console = null;
  }
};

function warpByTicksToUnixTime(unixTime) {
  util.warpToUnixTime(unixTime);
  var ticks = (unixTime * 1000) - Date.now();
  jest.advanceTimersByTime(ticks);
}

util.warpToDistantFuture = function () {
  warpByTicksToUnixTime(9999999999999);
};

util.warpToDistantPast = function () {
  warpByTicksToUnixTime(0);
};

util.warpToUnixTime = function (unixTime) {
  expect(isNaN(unixTime)).toBe(false);
  jest.spyOn(Date, 'now').mockReturnValue(unixTime * 1000);
};

util.warpByTicksToUnixTime = function (unixTime) {
  warpByTicksToUnixTime(unixTime);
};

function generateXHRPair(request, response, uri, responseVars) {
  return new Promise(function(resolve) {
    responseVars = responseVars || {};
    responseVars.uri = responseVars.uri || uri;

    // Import the desired xhr
    var responseXHR = typeof response === 'object' ? response : require('./xhr/' + response);
    responseXHR = {...responseXHR};

    // Change the request uri to include the domain
    if (request) {
      request.uri = uri + request.uri;
    }

    // Change the responses to use the desired uri
    var compiledTmpl = _.template(JSON.stringify(responseXHR.response));
    responseXHR.response = JSON.parse(compiledTmpl(responseVars));

    // Place response into responseText (AuthClient SDK depends on this)
    if (!responseXHR.response) {
      responseXHR.responseText = '';
    } else {
      responseXHR.responseText = JSON.stringify(responseXHR.response);
    }

    // Fill headers
    var headers = responseXHR.headers || {};
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    responseXHR.headers = headers;

    resolve({
      request: request,
      response: responseXHR
    });
  });
}

function mockAjax(pairs) {

  var allPairs = [];

  function setNextPair(pair) {
    if (_.isArray(pair)) {
      allPairs = pair.concat(allPairs);
    } else {
      allPairs.unshift(pair);
    }
  }

  function done() {
    if (allPairs.length !== 0) {
      throw new Error('Not all staged XHRs were executed');
    }
  }

  if (pairs) {
    setNextPair(pairs);
  }

  jest.spyOn(global, 'fetch').mockImplementation(function (url, args) {
    var pair = allPairs.shift();
    if (!pair) {
      throw new Error('We are making a request that we have not anticipated: ' + url);
    }

    if (pair.request.withCredentials === true) {
      // Make sure every request is attaching cookies
      expect(args.credentials).toEqual('include');
    }

    if (pair.request) {
      expect(pair.request.uri).toEqual(url);

      if (pair.request.headers) {
        expect(pair.request.headers).toEqual(args.headers);
      }
    }

    return new Promise(function(resolve, reject) {
      var xhr = pair.response;
      
      xhr.headers = new Map(Object.entries(xhr.headers));
      xhr.ok = xhr.status >= 200 && xhr.status < 300;
      xhr.json = function() {
        return Promise.resolve(xhr.response);
      };
      xhr.text = function() {
        return Promise.resolve(xhr.responseText);
      };

      if (xhr.status > 0 && xhr.status < 300) {
        _.defer(function () { resolve(xhr); });
      } else {
        xhr.responseJSON = xhr.response;
        reject(xhr);
      }
    });
  });

  return {
    setNextPair: setNextPair,
    done: done
  };
}

function setup(options) {
  if (typeof options === 'function') {
    options = options();
  }

  if (!options.issuer) {
    options.issuer = 'https://auth-js-test.okta.com';
  }
  var baseUri = options.issuer.indexOf('/oauth2') > 0 ? options.issuer.split('/oauth2')[0] : options.issuer;

  if (typeof options.pkce === 'undefined') {
    options.pkce = false;
  }

  var ajaxMock, resReply, oa, trans;

  return Promise.resolve()
    .then(function() {

      if (options.time) {
        util.warpToUnixTime(options.time);
      }

      // 1. Setup ajax mock
      if (options.calls) {

        // Get all the pairs and load the mock
        var xhrGenPromises = [];
        _.each(options.calls, function(call) {
          var xhrGenPromise = generateXHRPair(call.request, call.response, baseUri, call.responseVars);
          xhrGenPromises.push(xhrGenPromise);
        });

        return Promise.all(xhrGenPromises)
          .then(function (pairs) {
            ajaxMock = mockAjax(pairs);
            resReply = _.last(pairs).response;
          });

      } else if (options.response) {
        return generateXHRPair(options.request, options.response, baseUri, options.responseVars)
          .then(function(pair) {
            // Load the single response as a pair
            ajaxMock = mockAjax(pair);
            resReply = pair.response;
          });
      } else {
        ajaxMock = mockAjax();
      }
    })
    .then(function() {
      if (options.beforeClient) {
        options.beforeClient();
      }

      // 2. Setup OktaAuth
      oa = new OktaAuth({
        pkce: options.pkce,
        issuer: options.issuer,
        clientId: options.clientId,
        redirectUri: options.redirectUri,
        transformErrorXHR: options.transformErrorXHR,
        headers: options.headers,
        ignoreSignature: options.bypassCrypto === true,
        tokenManager: {
          autoRenew: false,
          autoRemove: false
        }
      });

      // 3. Initialize status if passed in
      if (options.status) {
        var request = {
          uri: '/api/v1/authn',
          data: {
            stateToken: 'dummy'
          }
        };
        return generateXHRPair(request, options.status, baseUri)
          .then(function(pair) {
            ajaxMock.setNextPair({
              request: pair.request,
              response: pair.response
            });
            return oa.tx.resume({stateToken: 'dummy'});
          })
          .then(function(t) {
            trans = t;
          });
      }
    })
    .then(function() {
      var ret = {};

      ret.oa = oa;
      ret.trans = trans;
      ret.ajaxMock = ajaxMock;

      if (resReply) {
        ret.resReply = resReply;
        ret.responseBody = resReply.response;
        ret.headers = resReply.headers;
      }

      return ret;
    });
}

util.itMakesCorrectRequestResponse = function (options) {
  var fn = options.only ? it.only : it,
      title = options.title || 'makes correct request and returns response';
  fn(title, function () {
    return setup(options.setup).then(function (test) {
      return options.execute(test)
      .then(function (res) {
        var resp = res;
        if (res.data) {
          test.trans = res;
          resp = test.responseBody;
          if (resp && typeof resp === 'object') {
            resp = {
              ...resp, 
              headers: test.headers,
              _http: expect.objectContaining({
                status: expect.any(Number),
                headers: test.headers
              })
            };
          }
        }
        if (options.expectations) {
          options.expectations(test, res, resp);
        } else if (test.trans) {
          expect(test.trans.data).toEqual(resp);
        }
        test.ajaxMock.done();
      });
    });
  }, options.timeout);
};

util.itErrorsCorrectly = function (options) {
  var fn = options.only ? it.only : it;
  fn(options.title, function (done) {
    return setup(options.setup).then(function (test) {
      return options.execute(test)
      .catch(function (err) {
        if (options.expectations) {
          options.expectations(test, err);
          test.ajaxMock.done();
        }
        else {
          expect(err.xhr.status).toEqual(test.resReply.status);

          // Cannot test xhr
          var rb = test.responseBody;
          expect(err.errorCode).toEqual(rb.errorCode);
          expect(err.errorSummary).toEqual(rb.errorSummary);
          expect(err.errorLink).toEqual(rb.errorLink);
          expect(err.errorId).toEqual(rb.errorId);
          expect(err.errorCauses).toEqual(rb.errorCauses);

          test.ajaxMock.done();
        }
        done();
      });
    });
  }, options.timeout);
};

// Question: Should the error here somehow match our other error responses??
util.itErrorChecksInput = function (options) {
  var fn = options.only ? it.only : it;
  fn(options.title, function (done) {
    return setup(options.setup).then(function (test) {
      return options.execute(test)
      .catch(function (err) {
        util.assertAuthSdkError(err, options.errorMsg);
        test.ajaxMock.done();
        done();
      });
    });
  });
};

util.parseUri = function (uri) {
  var split = uri.split('?');
  return {
    baseUri: split[0],
    queryParams: this.parseQueryParams(split[1])
  };
};

util.parseQueryParams = function (query) {
  var match,
      pl = /\+/g,  // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
      obj = {};

  function decode(s) {
    return decodeURIComponent(s.replace(pl, ' '));
  }

  match = search.exec(query);
  while (match) {
    obj[decode(match[1])] = decode(match[2]);
    match = search.exec(query);
  }

  return obj;
};

util.mockSetWindowLocation = function (client) {
  return jest.spyOn(client.token.getWithRedirect, '_setLocation');
};

util.mockSetCookie = function () {
  return jest.spyOn(cookies, 'set');
};

util.mockDeleteCookie = function () {
  return jest.spyOn(cookies, 'delete');
};

util.mockGetCookie = function (text) {
  return jest.spyOn(cookies, 'get').mockReturnValue(text || '');
};

util.mockGetHistory = function (client, mockHistory) {
  jest.spyOn(client.token.parseFromUrl, '_getHistory').mockReturnValue(mockHistory);
};

util.mockGetDocument = function (client, mockDocument) {
  jest.spyOn(client.token.parseFromUrl, '_getDocument').mockReturnValue(mockDocument);
};

util.mockGetLocation = function (client, mockLocation) {
  jest.spyOn(client.token.parseFromUrl, '_getLocation').mockReturnValue(mockLocation);
};

util.mockUserAgent = function (client, mockUserAgent) {
  jest.spyOn(global.window.navigator, 'userAgent', 'get').mockReturnValue(mockUserAgent);
};

util.mockSessionStorage = function ({ enabled, getItemMock, setItemMock, removeItemMock }) {
  jest.spyOn(browserStorage, 'browserHasSessionStorage')
    .mockImplementation(() => !!enabled);
  jest.spyOn(browserStorage, 'getSessionStorage')
    .mockImplementation(() => ({
      setItem: setItemMock,
      getItem: getItemMock,
      removeItem: removeItemMock
    }));
};

util.expectErrorToEqual = function (actual, expected) {
  expect(actual.name).toEqual(expected.name);
  expect(actual.message).toEqual(expected.message);
  expect(actual.errorCode).toEqual(expected.errorCode);
  expect(actual.errorSummary).toEqual(expected.errorSummary);
  if (expected.errorLink) {
    expect(actual.errorLink).toEqual(expected.errorLink);
    expect(actual.errorId).toEqual(expected.errorId);
    expect(actual.errorCauses).toEqual(expected.errorCauses);
  } else {
    expect(actual.errorLink).toBeUndefined();
    expect(actual.errorId).toBeUndefined();
    expect(actual.errorCauses).toBeUndefined();
  }
  if (expected.tokenKey) {
    expect(actual.tokenKey).toEqual(expected.tokenKey);
  } else {
    expect(actual.tokenKey).toBeUndefined();
  }

  if (typeof expected.accessToken !== 'undefined') {
    expect(actual.accessToken).toEqual(expected.accessToken);
  } else {
    expect(actual.accessToken).toBeUndefined();
  }
};

util.assertAuthSdkError = function (err, message) {
  expect(err.name).toEqual('AuthSdkError');
  expect(err.message).toEqual(message);
  expect(err.errorCode).toEqual('INTERNAL');
  expect(err.errorSummary).toEqual(message);
  expect(err.errorLink).toEqual('INTERNAL');
  expect(err.errorId).toEqual('INTERNAL');
  expect(err.errorCauses).toEqual([]);
};

util.disableLeaderElection = function() {
  jest.spyOn(ServiceManager, 'canUseLeaderElection').mockReturnValue(false);
};

util.mockLeader = function() {
  jest.spyOn(ServiceManager.prototype, 'isLeader').mockReturnValue(true);
};

export default util;
