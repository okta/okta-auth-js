/* globals jasmine, define, spyOn, expect, JSON */
/* eslint-disable max-statements, complexity */
define(function(require) {
  var Q = require('q'),
      $ = require('jquery'),
      _ = require('lodash'),
      OktaAuth = require('OktaAuth'),
      cookies = require('../../lib/cookies');

  function generateXHRPair(request, response, uri) {
    return Q.Promise(function(resolve) {

      // Import the desired xhr
      var responseXHR = require('../xhr/' + response);

      // Change the request uri to include the domain
      if (request) {
        request.uri = uri + request.uri;
      }

      // Change the responses to use the desired uri
      var compiledTmpl = _.template(JSON.stringify(responseXHR.response));
      responseXHR.response = JSON.parse(compiledTmpl({uri: uri}));

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

    spyOn($, 'ajax').and.callFake(function(args) {

      var pair = allPairs.shift();
      if (!pair) {
        throw new Error('We are making a request that we have not anticipated.');
      }

      // Make sure every request is attaching cookies
      expect(args.xhrFields).toEqual({
        withCredentials: true
      });

      if (pair.request) {
        expect(pair.request.uri).toEqual(args.url);
        if (pair.request.data || args.data) {
          expect(pair.request.data).toEqual(JSON.parse(args.data));
        }
        if (pair.request.headers) {
          expect(pair.request.headers).toEqual(args.headers);
        }
      }

      var deferred = $.Deferred();
      var xhr = pair.response;
      if (xhr.status > 0 && xhr.status < 300) {
        // $.ajax send (data, textStatus, jqXHR) on success
        _.defer(function () { deferred.resolve(xhr.response, null, xhr); });
      } else {
        // $.ajax send (jqXHR, textStatus, errorThrown) on failure
        xhr.responseJSON = xhr.response;
        deferred.reject(xhr, null, xhr.response);
      }
      return deferred;
    });

    return {
      setNextPair: setNextPair,
      done: done
    };
  }

  function setup(options) {
    if (!options.uri) {
      options.uri = 'http://foo.com';
    }

    var ajaxMock, resReply, oa, trans;

    return new Q()
      .then(function() {

        // 1. Setup ajax mock
        if (options.calls) {
          
          // Get all the pairs and load the mock
          var xhrGenPromises = [];
          _.each(options.calls, function(call) {
            var xhrGenPromise = generateXHRPair(call.request, call.response, options.uri);
            xhrGenPromises.push(xhrGenPromise);
          });

          return Q.all(xhrGenPromises)
            .then(function (pairs) {
              ajaxMock = mockAjax(pairs);
              resReply = _.last(pairs).response;
            });

        } else if (options.response) {
          return generateXHRPair(options.request, options.response, options.uri)
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

        // 2. Setup OktaAuth
        oa = new OktaAuth({
          url: options.uri,
          transformErrorXHR: options.transformErrorXHR,
          headers: options.headers
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

  var util = {};

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
            test.ajaxMock.done();
          } else {
            expect(test.trans.data).toEqual(test.responseBody);
            test.ajaxMock.done();
          }
          done();
        });
      });
    });
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

          expect(err.message).toEqual(options.errorMsg);
          expect(err.errorCode).toEqual('INTERNAL');
          expect(err.errorSummary).toEqual(options.errorMsg);
          expect(err.errorLink).toEqual('INTERNAL');
          expect(err.errorId).toEqual('INTERNAL');
          expect(err.errorCauses).toEqual([]);

          test.ajaxMock.done();
          done();
        });
      });
    });
  };

  util.warpToDistantFuture = function () {
    jasmine.clock().mockDate(new Date(9999999999999));
  };

  util.warpToDistantPast = function () {
    jasmine.clock().mockDate(new Date(0));
  };

  util.warpToUnixTime = function (unixTime) {
    jasmine.clock().mockDate(new Date(unixTime * 1000));
  };

  util.returnToPresent = function () {
    jasmine.clock().mockDate(new Date());
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
    spyOn(Q, 'delay').and.callFake(function() {
      return original.call(this, 0);
    });
  };

  util.mockGetWindowLocation = function (client, href) {
    spyOn(client.idToken.authorize, '_getLocationHref').and.returnValue(href);
  };

  util.mockSetWindowLocation = function (client) {
    return spyOn(client.token.getWithRedirect, '_setLocation');
  };

  util.mockSetCookie = function () {
    return spyOn(cookies.setCookie, '_setDocumentCookie');
  };

  util.mockGetCookie = function (text) {
    spyOn(cookies.getCookie, '_getDocumentCookie').and.returnValue(text || '');
  };

  util.mockGetLocationHash = function (client, hash) {
    spyOn(client.token.parseFromUrl, '_getLocationHash').and.returnValue(hash);
  };

  return util;
});
