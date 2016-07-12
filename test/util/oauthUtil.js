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
    claims: tokens.standardIdTokenClaims
  };

  oauthUtil.setup = function(opts) {

    if (opts &&
        (opts.authorizeArgs && opts.authorizeArgs.responseMode !== 'fragment') ||
        opts.getWithoutPromptArgs ||
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
    } else {
      promise = authClient.idToken.authorize(opts.authorizeArgs);
    }
    return promise
      .then(function(res) {
        var expectedResp = defaultResponse;
        expect(res.idToken).toEqual(expectedResp.idToken);
        expect(res.claims).toEqual(expectedResp.claims);
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

  return oauthUtil;
});
