/* jshint es3:false */
/* jshint maxcomplexity:8 */
/* globals define, expect, spyOn */
define(function(require) {
  var OktaAuth = require('OktaAuth');
  var util = require('../util/util');

  var standardClaims = {
    'sub': '00u1pcla5qYIREDLWCQV',
    'name': 'Len Boyette',
    'given_name': 'Len',
    'family_name': 'Boyette',
    'updated_at': 1446153401,
    'email': 'lboyette@okta.com',
    'email_verified': true,
    'ver': 1,
    'iss': 'https://lboyette.trexcloud.com',
    'login': 'admin@okta.com',
    'aud': 'NPSfOkH5eZrTy8PMDlvx',
    'iat': 1449696330,
    'exp': 1449699930,
    'amr': [
      'kba',
      'mfa',
      'pwd'
    ],
    'jti': 'TRZT7RCiSymTs5W7Ryh3',
    'auth_time': 1449696330
  };
  var standardIdToken = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwMHUxcGNsYTVxWUlSRU' +
                        'RMV0NRViIsIm5hbWUiOiJMZW4gQm95ZXR0ZSIsImdpdmVuX25hb' +
                        'WUiOiJMZW4iLCJmYW1pbHlfbmFtZSI6IkJveWV0dGUiLCJ1cGRh' +
                        'dGVkX2F0IjoxNDQ2MTUzNDAxLCJlbWFpbCI6Imxib3lldHRlQG9' +
                        'rdGEuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInZlciI6MS' +
                        'wiaXNzIjoiaHR0cHM6Ly9sYm95ZXR0ZS50cmV4Y2xvdWQuY29tI' +
                        'iwibG9naW4iOiJhZG1pbkBva3RhLmNvbSIsImF1ZCI6Ik5QU2ZP' +
                        'a0g1ZVpyVHk4UE1EbHZ4IiwiaWF0IjoxNDQ5Njk2MzMwLCJleHA' +
                        'iOjE0NDk2OTk5MzAsImFtciI6WyJrYmEiLCJtZmEiLCJwd2QiXS' +
                        'wianRpIjoiVFJaVDdSQ2lTeW1UczVXN1J5aDMiLCJhdXRoX3Rpb' +
                        'WUiOjE0NDk2OTYzMzB9.YWCNE3ZvT-8ceKnAbTkmSxYE-jIPpfh' +
                        '2s8f_hTagUUxrfdKgyWzBb9iN3GOPaQ2K6jqOFx90RI2GBzAWec' +
                        'pel3sAxG-wvLqiy0d8g0CUb7XTHdhXOLRrXvlpbULxdNnMbBcc6' +
                        'uOLDalBjrumOiDMLzti-Bx6uQQ0EjUwuC-Dhv7I3wMsVxyEKejv' +
                        'jMLbfWJ6iu4-UUx1r8_ZZUjDDXSB3OFXJQ3nPwRVFXZuRNhGScL' +
                        'nftXz7mypRGxrapIQusym1K8hk9uy8_KYL2H2QNbyIqK9Vh9JhY' +
                        '1rtkQNpv3ZerCUXEVGRiEXDqR_OHu4vUi1-FkONZZe2ov8dQ1mX' +
                        'iHHdw';
  /*
  {
    'sub': '00u1pcla5qYIREDLWCQV',
    'name': 'Len Boyette',
    'given_name': 'Len',
    'family_name': 'Boyette',
    'updated_at': 1446153401,
    'email': 'lboyette@okta.com',
    'email_verified': true,
    'ver': 1,
    'iss': 'https://lboyette.trexcloud.com',
    'login': 'admin@okta.com',
    'aud': 'NPSfOkH5eZrTy8PMDlvx',
    'iat': 2449696330,
    'exp': 1449699930,
    'amr': [
      'kba',
      'mfa',
      'pwd'
    ],
    'jti': 'TRZT7RCiSymTs5W7Ryh3',
    'auth_time': 1449696330
  }
  */
  var expiredBeforeIssuedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdW' +
                        'IiOiIwMHUxcGNsYTVxWUlSRURMV0NRViIsIm5hbWUiOiJMZW4gQm' +
                        '95ZXR0ZSIsImdpdmVuX25hbWUiOiJMZW4iLCJmYW1pbHlfbmFtZS' +
                        'I6IkJveWV0dGUiLCJ1cGRhdGVkX2F0IjoxNDQ2MTUzNDAxLCJlbW' +
                        'FpbCI6Imxib3lldHRlQG9rdGEuY29tIiwiZW1haWxfdmVyaWZpZW' +
                        'QiOnRydWUsInZlciI6MSwiaXNzIjoiaHR0cHM6Ly9sYm95ZXR0ZS' +
                        '50cmV4Y2xvdWQuY29tIiwibG9naW4iOiJhZG1pbkBva3RhLmNvbS' +
                        'IsImF1ZCI6Ik5QU2ZPa0g1ZVpyVHk4UE1EbHZ4IiwiaWF0IjoyND' +
                        'Q5Njk2MzMwLCJleHAiOjE0NDk2OTk5MzAsImFtciI6WyJrYmEiLC' +
                        'JtZmEiLCJwd2QiXSwianRpIjoiVFJaVDdSQ2lTeW1UczVXN1J5aD' +
                        'MiLCJhdXRoX3RpbWUiOjE0NDk2OTYzMzB9.7S5SvTiQE24Jg4Eu9' +
                        '-g2iJtD3KEViJ_JKn6tJqe0xUI';

  var standardState = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  var standardNonce = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  var defaultPostMessage = {
    'id_token': standardIdToken,
    state: standardState,
    nonce: standardNonce
  };
  var defaultResponse = {
    idToken: standardIdToken,
    claims: standardClaims
  };

  function setup(opts) {

    if (opts &&
        (opts.authorizeArgs && opts.authorizeArgs.responseMode !== 'fragment') ||
        (opts.refreshArgs)) {
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

    // Make sure the state is generated the same every time (standardState, standardNonce)
    spyOn(Math, 'random').and.callFake(function() {
      return 0;
    });

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
      time = standardClaims.exp - 1;
    }
    util.warpToUnixTime(time);

    if (opts.hrefMock) {
      util.mockWindowLocationHref(authClient, opts.hrefMock);
    }

    var promise;
    if (opts.refreshArgs) {
      promise = authClient.idToken.refresh(opts.refreshArgs);
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
  }

  function setupFrame(opts) {
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

    var iframeId = 'okta-oauth-helper-frame';
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

    return setup(opts)
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
  }

  function setupPopup(opts) {
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

    return setup(opts)
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
  }

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

  function itErrorsCorrectly(title, options, error) {
    it(title, function () {
      var thrown = false;
      try {
        setupFrame(options);
      } catch (e) {
        expectErrorToEqual(e, error);
        thrown = true;
      }
      expect(thrown).toEqual(true);
    });
  }

  function itpErrorsCorrectly(title, options, error) {
    it(title, function (done) {
      options.willFail = true;
      var setupMethod;
      if (options.authorizeArgs &&
          (options.authorizeArgs.responseMode === 'fragment' || options.authorizeArgs.idp)) {
        setupMethod = setupPopup;
      } else {
        setupMethod = setupFrame;
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
  }

  describe('OAuth Methods', function () {

    describe('idToken.refresh', function () {
      it('returns new id_token using old id_token', function (done) {
        return setupFrame({
          oktaAuthArgs: {
            url: 'https://lboyette.trexcloud.com',
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            redirectUri: 'https://lboyette.trexcloud.com/redirect'
          },
          refreshArgs: {},
          postMessageSrc: {
            baseUri: 'https://lboyette.trexcloud.com/oauth2/v1/authorize',
            queryParams: {
              'client_id': 'NPSfOkH5eZrTy8PMDlvx',
              'redirect_uri': 'https://lboyette.trexcloud.com/redirect',
              'response_type': 'id_token',
              'response_mode': 'okta_post_message',
              'state': standardState,
              'nonce': standardNonce,
              'scope': 'openid email',
              'prompt': 'none'
            }
          }
        })
        .fin(function() {
          done();
        });
      });
    });

    describe('idToken.authorize', function () {

      it('returns id_token using sessionToken', function (done) {
        return setupFrame({
          authorizeArgs: {
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            redirectUri: 'https://lboyette.trexcloud.com/redirect',
            sessionToken: 'testSessionToken'
          },
          postMessageSrc: {
            baseUri: 'https://lboyette.trexcloud.com/oauth2/v1/authorize',
            queryParams: {
              'client_id': 'NPSfOkH5eZrTy8PMDlvx',
              'redirect_uri': 'https://lboyette.trexcloud.com/redirect',
              'response_type': 'id_token',
              'response_mode': 'okta_post_message',
              'state': standardState,
              'nonce': standardNonce,
              'scope': 'openid email',
              'prompt': 'none',
              'sessionToken': 'testSessionToken'
            }
          }
        })
        .fin(function() {
          done();
        });
      });

      it('returns id_token using idp', function (done) {
        return setupPopup({
          authorizeArgs: {
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            redirectUri: 'https://lboyette.trexcloud.com/redirect',
            idp: 'testIdp'
          },
          postMessageSrc: {
            baseUri: 'https://lboyette.trexcloud.com/oauth2/v1/authorize',
            queryParams: {
              'client_id': 'NPSfOkH5eZrTy8PMDlvx',
              'redirect_uri': 'https://lboyette.trexcloud.com/redirect',
              'response_type': 'id_token',
              'response_mode': 'okta_post_message',
              'display': 'popup',
              'state': standardState,
              'nonce': standardNonce,
              'scope': 'openid email',
              'idp': 'testIdp'
            }
          }
        })
        .fin(function() {
          done();
        });
      });

      it('returns id_token using iframe', function (done) {
        return setupFrame({
          authorizeArgs: {
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            redirectUri: 'https://lboyette.trexcloud.com/redirect',
            sessionToken: 'testToken'
          }
        })
        .fin(function() {
          done();
        });
      });

      it('returns id_token using popup fragment', function (done) {
        return setupPopup({
          hrefMock: 'https://lboyette.trexcloud.com',
          changeToHash: '#id_token=' + standardIdToken + '&state=' + standardState + '&nonce=' + standardNonce,
          authorizeArgs: {
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            redirectUri: 'https://lboyette.trexcloud.com/redirect',
            idp: 'testIdp',
            responseMode: 'fragment'
          },
          postMessageSrc: {
            baseUri: 'https://lboyette.trexcloud.com/oauth2/v1/authorize',
            queryParams: {
              'client_id': 'NPSfOkH5eZrTy8PMDlvx',
              'redirect_uri': 'https://lboyette.trexcloud.com/redirect',
              'response_type': 'id_token',
              'response_mode': 'fragment',
              'display': 'popup',
              'state': standardState,
              'nonce': standardNonce,
              'scope': 'openid email',
              'idp': 'testIdp'
            }
          }
        })
        .fin(function() {
          done();
        });
      });

      it('doesn\'t throw an error when redirectUri and clientId are passed via OktaAuth', function (done) {
        return setupFrame({
          oktaAuthArgs: {
            url: 'https://lboyette.trexcloud.com',
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            redirectUri: 'https://lboyette.trexcloud.com/redirect'
          },
          authorizeArgs: {
            sessionToken: 'testToken'
          }
        })
        .fin(function() {
          done();
        });
      });

      describe('scope', function () {
        it('includes default scope in the uri', function (done) {
          return setupFrame({
            authorizeArgs: {
              clientId: 'NPSfOkH5eZrTy8PMDlvx',
              redirectUri: 'https://lboyette.trexcloud.com/redirect',
              sessionToken: 'testToken'
            },
            postMessageSrc: {
              baseUri: 'https://lboyette.trexcloud.com/oauth2/v1/authorize',
              queryParams: {
                'client_id': 'NPSfOkH5eZrTy8PMDlvx',
                'redirect_uri': 'https://lboyette.trexcloud.com/redirect',
                'response_type': 'id_token',
                'response_mode': 'okta_post_message',
                'state': standardState,
                'nonce': standardNonce,
                'scope': 'openid email',
                'prompt': 'none',
                'sessionToken': 'testToken'
              }
            }
          })
          .fin(done);
        });
        it('includes specified scope in the uri', function (done) {
          return setupFrame({
            authorizeArgs: {
              clientId: 'NPSfOkH5eZrTy8PMDlvx',
              redirectUri: 'https://lboyette.trexcloud.com/redirect',
              scope: ['openid', 'testscope'],
              sessionToken: 'testToken'
            },
            postMessageSrc: {
              baseUri: 'https://lboyette.trexcloud.com/oauth2/v1/authorize',
              queryParams: {
                'client_id': 'NPSfOkH5eZrTy8PMDlvx',
                'redirect_uri': 'https://lboyette.trexcloud.com/redirect',
                'response_type': 'id_token',
                'response_mode': 'okta_post_message',
                'state': standardState,
                'nonce': standardNonce,
                'scope': 'openid testscope',
                'prompt': 'none',
                'sessionToken': 'testToken'
              }
            }
          })
          .fin(done);
        });

        it('uses the current href as the redirect_uri when it\'s not provided', function (done) {
          return setupFrame({
            authorizeArgs: {
              clientId: 'NPSfOkH5eZrTy8PMDlvx',
              sessionToken: 'testToken'
            },
            postMessageSrc: {
              baseUri: 'https://lboyette.trexcloud.com/oauth2/v1/authorize',
              queryParams: {
                'client_id': 'NPSfOkH5eZrTy8PMDlvx',
                'redirect_uri': window.location.href,
                'response_type': 'id_token',
                'response_mode': 'okta_post_message',
                'state': standardState,
                'nonce': standardNonce,
                'scope': 'openid email',
                'prompt': 'none',
                'sessionToken': 'testToken'
              }
            }
          })
          .fin(done);
        });
      });

      describe('errors', function() {
        itErrorsCorrectly('throws an error when openid scope isn\'t specified',
          {
            authorizeArgs: {
              clientId: 'NPSfOkH5eZrTy8PMDlvx',
              redirectUri: 'https://lboyette.trexcloud.com/redirect',
              scope: ['notopenid'],
              sessionToken: 'testToken'
            }
          },
          {
            name: 'AuthSdkError',
            message: 'openid scope must be specified in the scope argument',
            errorCode: 'INTERNAL',
            errorSummary: 'openid scope must be specified in the scope argument',
            errorLink: 'INTERNAL',
            errorId: 'INTERNAL',
            errorCauses: []
          }
        );
        itErrorsCorrectly('throws an error when clientId isn\'t specified',
          {
            authorizeArgs: {
              redirectUri: 'https://lboyette.trexcloud.com/redirect',
              sessionToken: 'testToken'
            }
          },
          {
            name: 'AuthSdkError',
            message: 'A clientId must be specified in the OktaAuth constructor to get an idToken',
            errorCode: 'INTERNAL',
            errorSummary: 'A clientId must be specified in the OktaAuth constructor to get an idToken',
            errorLink: 'INTERNAL',
            errorId: 'INTERNAL',
            errorCauses: []
          }
        );
        itpErrorsCorrectly('throws an oauth error on issue',
          {
            authorizeArgs: {
              clientId: 'NPSfOkH5eZrTy8PMDlvx',
              redirectUri: 'https://lboyette.trexcloud.com/redirect',
              sessionToken: 'testToken'
            },
            postMessageResp: {
              error: 'sampleErrorCode',
              'error_description': 'something went wrong'
            }
          },
          {
            name: 'OAuthError',
            message: 'something went wrong',
            errorCode: 'sampleErrorCode',
            errorSummary: 'something went wrong'
          }
        );
        itpErrorsCorrectly('throws an oauth error on issue with a fragment response',
          {
            authorizeArgs: {
              clientId: 'NPSfOkH5eZrTy8PMDlvx',
              redirectUri: 'https://lboyette.trexcloud.com/redirect',
              idp: 'testIdp',
              responseMode: 'fragment'
            },
            hrefMock: 'https://lboyette.trexcloud.com',
            changeToHash: '#error=invalid_scope&error_description=' +
              'The+requested+scope+is+invalid%2C+unknown%2C+or+malformed.'
          },
          {
            name: 'OAuthError',
            message: 'The requested scope is invalid, unknown, or malformed.',
            errorCode: 'invalid_scope',
            errorSummary: 'The requested scope is invalid, unknown, or malformed.'
          }
        );
        itpErrorsCorrectly('throws an error when window is closed manually with a fragment',
          {
            authorizeArgs: {
              clientId: 'NPSfOkH5eZrTy8PMDlvx',
              redirectUri: 'https://lboyette.trexcloud.com/redirect',
              idp: 'testIdp',
              responseMode: 'fragment'
            },
            hrefMock: 'https://lboyette.trexcloud.com',
            closePopup: true
          },
          {
            name: 'AuthSdkError',
            message: 'Unable to parse OAuth flow response',
            errorCode: 'INTERNAL',
            errorSummary: 'Unable to parse OAuth flow response',
            errorLink: 'INTERNAL',
            errorId: 'INTERNAL',
            errorCauses: []
          }
        );
        itpErrorsCorrectly('throws an error when window is closed manually with a postMessage',
          {
            authorizeArgs: {
              clientId: 'NPSfOkH5eZrTy8PMDlvx',
              redirectUri: 'https://lboyette.trexcloud.com/redirect',
              idp: 'testIdp'
            },
            closePopup: true
          },
          {
            name: 'AuthSdkError',
            message: 'Unable to parse OAuth flow response',
            errorCode: 'INTERNAL',
            errorSummary: 'Unable to parse OAuth flow response',
            errorLink: 'INTERNAL',
            errorId: 'INTERNAL',
            errorCauses: []
          }
        );
        itpErrorsCorrectly('throws an sdk error when state doesn\'t match',
          {
            authorizeArgs: {
              clientId: 'NPSfOkH5eZrTy8PMDlvx',
              redirectUri: 'https://lboyette.trexcloud.com/redirect',
              sessionToken: 'testToken'
            },
            postMessageResp: {
              'id_token': standardIdToken,
              state: 'mismatchedState'
            }
          },
          {
            name: 'AuthSdkError',
            message: 'OAuth flow response state doesn\'t match request state',
            errorCode: 'INTERNAL',
            errorSummary: 'OAuth flow response state doesn\'t match request state',
            errorLink: 'INTERNAL',
            errorId: 'INTERNAL',
            errorCauses: []
          }
        );
        itpErrorsCorrectly('throws an sdk error when nonce doesn\'t match',
          {
            authorizeArgs: {
              clientId: 'NPSfOkH5eZrTy8PMDlvx',
              redirectUri: 'https://lboyette.trexcloud.com/redirect',
              sessionToken: 'testToken'
            },
            postMessageResp: {
              'id_token': standardIdToken,
              state: standardState,
              nonce: 'mismatchedNonce'
            }
          },
          {
            name: 'AuthSdkError',
            message: 'OAuth flow response nonce doesn\'t match request nonce',
            errorCode: 'INTERNAL',
            errorSummary: 'OAuth flow response nonce doesn\'t match request nonce',
            errorLink: 'INTERNAL',
            errorId: 'INTERNAL',
            errorCauses: []
          }
        );
        itpErrorsCorrectly('throws an sdk error when issuer doesn\'t match',
          {
            oktaAuthArgs: {
              url: 'https://different.issuer.com',
              clientId: 'NPSfOkH5eZrTy8PMDlvx',
              redirectUri: 'https://lboyette.trexcloud.com/redirect'
            },
            authorizeArgs: {
              sessionToken: 'testToken'
            }
          },
          {
            name: 'AuthSdkError',
            message: 'The issuer [https://lboyette.trexcloud.com] does not match [https://different.issuer.com]',
            errorCode: 'INTERNAL',
            errorSummary: 'The issuer [https://lboyette.trexcloud.com] does not match [https://different.issuer.com]',
            errorLink: 'INTERNAL',
            errorId: 'INTERNAL',
            errorCauses: []
          }
        );
        itpErrorsCorrectly('throws an sdk error when audience doesn\'t match',
          {
            authorizeArgs: {
              clientId: 'differentAudience',
              redirectUri: 'https://lboyette.trexcloud.com/redirect',
              sessionToken: 'testToken'
            }
          },
          {
            name: 'AuthSdkError',
            message: 'The audience [NPSfOkH5eZrTy8PMDlvx] does not match [differentAudience]',
            errorCode: 'INTERNAL',
            errorSummary: 'The audience [NPSfOkH5eZrTy8PMDlvx] does not match [differentAudience]',
            errorLink: 'INTERNAL',
            errorId: 'INTERNAL',
            errorCauses: []
          }
        );
        itpErrorsCorrectly('throws an sdk error when token expired before it was issued',
          {
            authorizeArgs: {
              clientId: 'NPSfOkH5eZrTy8PMDlvx',
              redirectUri: 'https://lboyette.trexcloud.com/redirect',
              sessionToken: 'testToken'
            },
            postMessageResp: {
              'id_token': expiredBeforeIssuedToken,
              state: standardState,
              nonce: standardNonce
            }
          },
          {
            name: 'AuthSdkError',
            message: 'The JWT expired before it was issued',
            errorCode: 'INTERNAL',
            errorSummary: 'The JWT expired before it was issued',
            errorLink: 'INTERNAL',
            errorId: 'INTERNAL',
            errorCauses: []
          }
        );
        itpErrorsCorrectly('throws an sdk error when token is expired',
          {
            time: 9999999999,
            authorizeArgs: {
              clientId: 'NPSfOkH5eZrTy8PMDlvx',
              redirectUri: 'https://lboyette.trexcloud.com/redirect',
              sessionToken: 'testToken'
            }
          },
          {
            name: 'AuthSdkError',
            message: 'The JWT expired and is no longer valid',
            errorCode: 'INTERNAL',
            errorSummary: 'The JWT expired and is no longer valid',
            errorLink: 'INTERNAL',
            errorId: 'INTERNAL',
            errorCauses: []
          }
        );
        itpErrorsCorrectly('throws an sdk error when token is issued in the future',
          {
            time: 0,
            authorizeArgs: {
              clientId: 'NPSfOkH5eZrTy8PMDlvx',
              redirectUri: 'https://lboyette.trexcloud.com/redirect',
              sessionToken: 'testToken'
            }
          },
          {
            name: 'AuthSdkError',
            message: 'The JWT was issued in the future',
            errorCode: 'INTERNAL',
            errorSummary: 'The JWT was issued in the future',
            errorLink: 'INTERNAL',
            errorId: 'INTERNAL',
            errorCauses: []
          }
        );
      });
    });
  });
});
