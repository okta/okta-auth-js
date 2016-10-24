/* eslint-disable complexity, max-statements */
define(function(require) {
  var util = require('../util/util');
  var OktaAuth = require('OktaAuth');
  var tokens = require('./tokens');
  var Q = require('q');
  var EventEmitter = require('tiny-emitter');
  var _ = require('lodash');

  var oauthUtil = {};

  // These are the result of the state and nonce after mocking
  oauthUtil.mockedState = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  oauthUtil.mockedNonce = oauthUtil.mockedState;

  oauthUtil.mockedState2 = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  oauthUtil.mockedNonce2 = oauthUtil.mockedState2;

  oauthUtil.mockStateAndNonce = function() {
    // Make sure the state is generated the same every time (standardState, standardNonce)
    spyOn(Math, 'random').and.callFake(function() {
      return 0;
    });  
  };

  var defaultPostMessage = {
    'id_token': tokens.standardIdToken,
    state: oauthUtil.mockedState
  };

  var defaultResponse = {
    idToken: tokens.standardIdToken,
    claims: tokens.standardIdTokenClaims,
    expiresAt: 1449699930,
    scopes: ['openid', 'email']
  };

  function getTime(time) {
    if (time || time === 0) {
      return time;
    } else {
      return tokens.standardIdTokenClaims.exp - 1;
    }
  }

  function validateResponse(res, expectedResp) {
    function expectResponsesToEqual(actual, expected) {
      expect(actual.idToken).toEqual(expected.idToken);
      expect(actual.claims).toEqual(expected.claims);
      expect(actual.accessToken).toEqual(expected.accessToken);
      expect(actual.expiresAt).toEqual(expected.expiresAt);
      expect(actual.tokenType).toEqual(expected.tokenType);
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

  oauthUtil.setup = function(opts) {

    if (opts &&
        (opts.authorizeArgs && opts.authorizeArgs.responseMode !== 'fragment') ||
        opts.getWithoutPromptArgs ||
        opts.getWithPopupArgs ||
        opts.tokenManagerRefreshArgs ||
        opts.refreshArgs ||
        opts.tokenRefreshArgs ||
        opts.autoRefresh) {
      // Simulate the postMessage between the window and the popup or iframe
      spyOn(window, 'addEventListener').and.callFake(function(eventName, fn) {
        if (eventName === 'message' && !opts.closePopup) {
          // Call postMessage on the next tick
          setTimeout(function() {
            fn({
              data: opts.postMessageResp || defaultPostMessage,
              origin: opts.oktaAuthArgs && opts.oktaAuthArgs.url ||
                'https://auth-js-test.okta.com'
            });
          });
        }
      });
    }

    oauthUtil.mockStateAndNonce();

    var authClient;
    if (opts.oktaAuthArgs) {
      authClient = new OktaAuth(opts.oktaAuthArgs);
    } else {
      authClient = new OktaAuth({
        url: 'https://auth-js-test.okta.com'
      });
    }

    util.warpToUnixTime(getTime(opts.time));

    if (opts.hrefMock) {
      util.mockGetWindowLocation(authClient, opts.hrefMock);
    }

    if (opts.tokenManagerAddKeys) {
      for (var key in opts.tokenManagerAddKeys) {
        if (!opts.tokenManagerAddKeys.hasOwnProperty(key)) {
          continue;
        }
        var token = opts.tokenManagerAddKeys[key];
        authClient.tokenManager.add(key, token);
      }
    }

    var promise;
    if (opts.refreshArgs) {
      promise = authClient.idToken.refresh(opts.refreshArgs);
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
    } else if (opts.tokenManagerRefreshArgs) {
      promise = authClient.tokenManager.refresh.apply(this, opts.tokenManagerRefreshArgs);
    } else if (opts.tokenRefreshArgs) {
      promise = authClient.token.refresh.apply(this, opts.tokenRefreshArgs);
    } else if (opts.autoRefresh) {
      var refreshDeferred = Q.defer();
      authClient.tokenManager.on('refreshed', function() {
        refreshDeferred.resolve();
      });
      authClient.tokenManager.on('expired', function() {
        refreshDeferred.resolve();
      });
      promise = refreshDeferred.promise;
    } else {
      promise = authClient.idToken.authorize(opts.authorizeArgs);
    }

    if (opts.fastForwardToTime) {
      util.warpByTicksToUnixTime(opts.fastForwardToTime);
    }

    return promise
      .then(function(res) {
        if (opts.autoRefresh) {
          return;
        }

        var expectedResp = opts.expectedResp || defaultResponse;
        validateResponse(res, expectedResp);
      })
      .fail(function(err) {
        if (opts.willFail) {
          throw err;
        } else {
          expect('not to be hit').toBe(true);
          console.log(err); // eslint-disable-line
        }
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
    spyOn(body, 'appendChild').and.callFake(function (el) {
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
      var el = body.appendChild.calls.mostRecent().args[0];
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
        hash: ''
      },
      closed: false,
      close: function() {
        this.closed = true;
      }
    };
    spyOn(fakeWindow, 'close').and.callThrough();

    spyOn(window, 'open').and.callFake(function(s) {
      src = s;
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
    var client = new OktaAuth(opts.oktaAuthArgs || {
      url: 'https://auth-js-test.okta.com',
      clientId: 'NPSfOkH5eZrTy8PMDlvx',
      redirectUri: 'https://example.com/redirect'
    });

    oauthUtil.mockStateAndNonce();
    var windowLocationMock = util.mockSetWindowLocation(client);
    var setCookieMock = util.mockSetCookie();

    if (Array.isArray(opts.getWithRedirectArgs)) {
      client.token.getWithRedirect.apply(null, opts.getWithRedirectArgs);
    } else {
      client.token.getWithRedirect(opts.getWithRedirectArgs);
    }

    expect(windowLocationMock).toHaveBeenCalledWith(opts.expectedRedirectUrl);

    _.each(opts.expectedCookies, function(cookie) {
      expect(setCookieMock).toHaveBeenCalledWith(cookie);
    });
  };

  oauthUtil.setupParseUrl = function(opts) {
    var client = new OktaAuth({
      url: 'https://auth-js-test.okta.com',
      clientId: 'NPSfOkH5eZrTy8PMDlvx',
      redirectUri: 'https://example.com/redirect'
    });

    util.warpToUnixTime(getTime(opts.time));
    util.mockGetLocationHash(client, opts.hashMock);
    util.mockGetCookie(opts.oauthCookie);
    var setCookieMock = util.mockSetCookie();

    return client.token.parseFromUrl()
      .then(function(res) {
        var expectedResp = opts.expectedResp;
        validateResponse(res, expectedResp);

        // The cookie should be deleted
        expect(setCookieMock).toHaveBeenCalledWith('okta-oauth-redirect-params=; path=/; ' +
          'expires=Thu, 01 Jan 1970 00:00:00 GMT;');
      });
  };

  oauthUtil.setupSimultaneousPostMessage = function() {
    // Create client
    var client =  new OktaAuth({
      url: 'https://auth-js-test.okta.com',
      clientId: 'NPSfOkH5eZrTy8PMDlvx',
      redirectUri: 'https://example.com/redirect'
    });

    var emitter = new EventEmitter();
    spyOn(window, 'addEventListener').and.callFake(function(eventName, fn) {
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
            throw 'Unrecognized state: ' + state;
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

    return new Q({
      client: client,
      emitter: emitter
    });
  };

  oauthUtil.itpErrorsCorrectly = function(title, options, error) {
    it(title, function (done) {
      options.willFail = true;
      var setupMethod;
      if (options.setupMethod) {
        setupMethod = options.setupMethod;
      } else if (options.authorizeArgs &&
          (options.authorizeArgs.responseMode === 'fragment' || options.authorizeArgs.idp)) {
        setupMethod = oauthUtil.setupPopup;
      } else {
        setupMethod = oauthUtil.setupFrame;
      }
      setupMethod(options)
        .then(function() {
          expect('not to be hit').toEqual(true);
        })
        .fail(function(e) {
          util.expectErrorToEqual(e, error);
        })
        .fin(done);
    });
  };
  
  oauthUtil.expectTokenStorageToEqual = function(storage, obj) {
    var parsed = JSON.parse(storage.getItem('okta-token-storage'));
    expect(parsed).toEqual(obj);
  };

  return oauthUtil;
});
