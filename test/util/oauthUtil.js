/* eslint-disable complexity, max-statements */
define(function(require) {
  var util = require('../util/util');
  var OktaAuth = require('OktaAuth');
  var tokens = require('./tokens');
  var packageJson = require('../../package.json');

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

  oauthUtil.setup = function(opts) {

    if (opts &&
        (opts.authorizeArgs && opts.authorizeArgs.responseMode !== 'fragment') ||
        opts.getWithoutPromptArgs ||
        opts.getWithPopupArgs ||
        opts.refreshArgs) {
      // Simulate the postMessage between the window and the popup or iframe
      spyOn(window, 'addEventListener').and.callFake(function(eventName, fn) {
        if (eventName === 'message' && !opts.closePopup) {
          // Call postMessage on the next tick
          setTimeout(function() {
            fn({
              data: opts.postMessageResp || defaultPostMessage,
              origin: opts.oktaAuthArgs && opts.oktaAuthArgs.url ||
                'https://lboyette.trexcloud.com'
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
        url: 'https://lboyette.trexcloud.com'
      });
    }

    // Make sure our token isn't expired
    var time;
    if (opts.time || opts.time === 0) {
      time = opts.time;
    } else {
      time = tokens.standardIdTokenClaims.exp - 1;
    }
    util.warpToUnixTime(time);

    if (opts.hrefMock) {
      util.mockWindowLocationHref(authClient, opts.hrefMock);
    }

    var promise;
    if (opts.refreshArgs) {
      promise = authClient.idToken.refresh(opts.refreshArgs);
    } else if (opts.getWithoutPromptArgs) {
      promise = authClient.token.getWithoutPrompt(opts.getWithoutPromptArgs);
    } else if (opts.getWithPopupArgs) {
      promise = authClient.token.getWithPopup(opts.getWithPopupArgs);
    } else {
      promise = authClient.idToken.authorize(opts.authorizeArgs);
    }
    return promise
      .then(function(res) {
        var expectedResp = opts.expectedResp || defaultResponse;

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
      })
      .fail(function(err) {
        if (opts.willFail) {
          throw err;
        } else {
          expect(err).toBeUndefined();
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

  function expectErrorToEqual(actual, expected) {
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
  }

  oauthUtil.itErrorsCorrectly = function(title, options, error) {
    it(title, function () {
      var thrown = false;
      try {
        oauthUtil.setupFrame(options);
      } catch (e) {
        expectErrorToEqual(e, error);
        thrown = true;
      }
      expect(thrown).toEqual(true);
    });
  };

  oauthUtil.itpErrorsCorrectly = function(title, options, error) {
    it(title, function (done) {
      options.willFail = true;
      var setupMethod;
      if (options.authorizeArgs &&
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
          expectErrorToEqual(e, error);
        })
        .fin(done);
    });
  };
  

  return oauthUtil;
});
