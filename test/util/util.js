/* globals expect, JSON */
/* eslint-disable max-statements, complexity */

var Q = require('q'),
    _ = require('lodash'),
    OktaAuth = require('OktaAuth'),
    cookies = require('../../lib/browser/browserStorage').storage,
    fetch = require('cross-fetch');

var util = {};


function warpByTicksToUnixTime(unixTime) {
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
  return Q.Promise(function(resolve) {
    responseVars = responseVars || {};
    responseVars.uri = responseVars.uri || uri;

    // Import the desired xhr
    var responseXHR = require('../xhr/' + response);

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

  fetch.mockImplementation(function (url, args) {
    var pair = allPairs.shift();
    if (!pair) {
      throw new Error('We are making a request that we have not anticipated.');
    }

    if (pair.request.withCredentials !== false) {
      // Make sure every request is attaching cookies
      expect(args.credentials).toEqual('include');
    }

    if (pair.request) {
      expect(pair.request.uri).toEqual(url);

      if (pair.request.headers) {
        expect(pair.request.headers).toEqual(args.headers);
      }
    }

    var deferred = Q.defer();
    var xhr = pair.response;
    xhr.headers = xhr.headers || {};
    xhr.headers['Content-Type'] = 'application/json';
    xhr.headers.get = function(attr) {
      return xhr.headers[attr];
    }
    xhr.ok = xhr.status >= 200 && xhr.status < 300;
    xhr.json = function() {
      return Q.Promise(function(resolve) {
        resolve(xhr.responseText);
      });
    }

    if (xhr.status > 0 && xhr.status < 300) {
      _.defer(function () { deferred.resolve(xhr); });
    } else {
      xhr.responseJSON = xhr.response;
      deferred.reject(xhr);
    }
    return deferred.promise;
  });

  return {
    setNextPair: setNextPair,
    done: done
  };
}

function setup(options) {
  if (!options.uri) {
    options.uri = 'https://auth-js-test.okta.com';
  }

  var ajaxMock, resReply, oa, trans;

  return new Q()
    .then(function() {

      if (options.time) {
        util.warpToUnixTime(options.time);
      }

      // 1. Setup ajax mock
      if (options.calls) {

        // Get all the pairs and load the mock
        var xhrGenPromises = [];
        _.each(options.calls, function(call) {
          var xhrGenPromise = generateXHRPair(call.request, call.response, options.uri, call.responseVars);
          xhrGenPromises.push(xhrGenPromise);
        });

        return Q.all(xhrGenPromises)
          .then(function (pairs) {
            ajaxMock = mockAjax(pairs);
            resReply = _.last(pairs).response;
          });

      } else if (options.response) {
        return generateXHRPair(options.request, options.response, options.uri, options.responseVars)
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
        url: options.uri,
        transformErrorXHR: options.transformErrorXHR,
        headers: options.headers,
        ignoreSignature: options.bypassCrypto === true
      });

      // 3. Initialize status if passed in
      if (options.status) {
        var request = {
          uri: '/api/v1/authn',
          data: {
            stateToken: 'dummy'
          }
        };
        return generateXHRPair(request, options.status, options.uri)
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
      }

      return ret;
    });
}

util.itMakesCorrectRequestResponse = function (options) {
  var fn = options.only ? it.only : it,
      title = options.title || 'makes correct request and returns response';
  fn(title, function (done) {
    return setup(options.setup).then(function (test) {
      return options.execute(test)
      // Add a tick for the setTimeout successFn
      .delay(0)
      .then(function (res) {
        if (res.data) {
          test.trans = res;
        }
        if (options.expectations) {
          options.expectations(test, res);
        } else if (test.trans) {
          expect(test.trans.data).toEqual(test.responseBody);
        }
        test.ajaxMock.done();
        done();
      });
    });
  }, options.timeout);
};

util.itErrorsCorrectly = function (options) {
  var fn = options.only ? it.only : it;
  fn(options.title, function (done) {
    return setup(options.setup).then(function (test) {
      return options.execute(test)
      // Add a tick for the setTimeout successFn
      .then(null, function(err) {
        return Q.delay(0)
        .thenReject(err);
      })
      .fail(function (err) {
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
  });
};

// Question: Should the error here somehow match our other error responses??
util.itErrorChecksInput = function (options) {
  var fn = options.only ? it.only : it;
  fn(options.title, function (done) {
    return setup(options.setup).then(function (test) {
      return options.execute(test)
      .fail(function (err) {
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

util.mockQDelay = function () {
  var original = Q.delay;
  jest.spyOn(Q, 'delay').mockImplementation(function() {
    return original.call(this, 0);
  });
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
  jest.spyOn(cookies, 'get').mockReturnValue(text || '');
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
  jest.spyOn(client.fingerprint, '_getUserAgent').mockReturnValue(mockUserAgent);
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

module.exports = util;
