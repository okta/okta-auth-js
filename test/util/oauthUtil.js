/* eslint-disable complexity, max-statements */
define(function(require) {
  var util = require('../util/util');
  var OktaAuth = require('OktaAuth');
  var tokens = require('./tokens');
  var packageJson = require('../../package.json');
  var Q = require('q');

  var oauthUtil = {};

  // These are the result of the state and nonce after mocking
  oauthUtil.mockedState = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  oauthUtil.mockedNonce = oauthUtil.mockedState;

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
      promise = authClient.token.getWithoutPrompt(opts.getWithoutPromptArgs);
    } else if (opts.getWithPopupArgs) {
      promise = authClient.token.getWithPopup(opts.getWithPopupArgs);
    } else if (opts.tokenManagerRefreshArgs) {
      promise = authClient.tokenManager.refresh.apply(this, opts.tokenManagerRefreshArgs);
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
      var ticks = (opts.fastForwardToTime * 1000) - Date.now();
      jasmine.clock().tick(ticks);
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
          // Should never hit this
          expect(true).toBe(false);
        }
      });
  };

  oauthUtil.setupFrame = function(opts) {
    var body = document.getElementsByTagName('body')[0];

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

    var iframeId = packageJson['okta-auth-js'].FRAME_ID;
    function iframeWasCreated() {
      expect(body.appendChild).toHaveBeenCalled();
      var el = body.appendChild.calls.mostRecent().args[0];
      expect(el.tagName).toEqual('IFRAME');
      expect(el.id).toEqual(iframeId);
      expect(el.style.display).toEqual('none');
    }

    function iframeWasDestroyed() {
      var iframe = document.getElementById(iframeId);
      expect(iframe).toBeNull();
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
    var client = new OktaAuth({
      url: 'https://auth-js-test.okta.com',
      clientId: 'NPSfOkH5eZrTy8PMDlvx',
      redirectUri: 'https://auth-js-test.okta.com/redirect'
    });

    oauthUtil.mockStateAndNonce();
    var windowLocationMock = util.mockSetWindowLocation(client);
    var setCookieMock = util.mockSetCookie();

    client.token.getWithRedirect(opts.getWithRedirectArgs);

    expect(windowLocationMock).toHaveBeenCalledWith(opts.expectedRedirectUrl);
    expect(setCookieMock).toHaveBeenCalledWith(opts.expectedCookie);
  };

  oauthUtil.setupParseUrl = function(opts) {
    var client = new OktaAuth({
      url: 'https://auth-js-test.okta.com',
      clientId: 'NPSfOkH5eZrTy8PMDlvx',
      redirectUri: 'https://auth-js-test.okta.com/redirect'
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
        expect(setCookieMock).toHaveBeenCalledWith('okta-oauth-redirect-params=; ' +
          'expires=Thu, 01 Jan 1970 00:00:00 GMT;');
      });
  };

  oauthUtil.itErrorsCorrectly = function(title, options, error) {
    it(title, function () {
      var thrown = false;
      try {
        oauthUtil.setupFrame(options);
      } catch (e) {
        util.expectErrorToEqual(e, error);
        thrown = true;
      }
      expect(thrown).toEqual(true);
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
