/* eslint-disable complexity, max-statements */
define(function(require) {
  var util = require('../util/util');
  var oauthUtil = require('../util/oauthUtil');
  var tokens = require('../util/tokens');

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
    'nonce': standardNonce,
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
  var expiredBeforeIssuedToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzd' +
                        'WIiOiIwMHUxcGNsYTVxWUlSRURMV0NRViIsIm5hbWUiOiJMZW4g' +
                        'Qm95ZXR0ZSIsImdpdmVuX25hbWUiOiJMZW4iLCJmYW1pbHlfbmF' +
                        'tZSI6IkJveWV0dGUiLCJ1cGRhdGVkX2F0IjoxNDQ2MTUzNDAxLC' +
                        'JlbWFpbCI6Imxib3lldHRlQG9rdGEuY29tIiwiZW1haWxfdmVya' +
                        'WZpZWQiOnRydWUsInZlciI6MSwiaXNzIjoiaHR0cHM6Ly9sYm95' +
                        'ZXR0ZS50cmV4Y2xvdWQuY29tIiwibG9naW4iOiJhZG1pbkBva3R' +
                        'hLmNvbSIsIm5vbmNlIjoiYWFhYWFhYWFhYWFhYWFhYWFhYWFhYW' +
                        'FhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhY' +
                        'WFhYSIsImF1ZCI6Ik5QU2ZPa0g1ZVpyVHk4UE1EbHZ4IiwiaWF0' +
                        'IjoyNDQ5Njk2MzMwLCJleHAiOjE0NDk2OTk5MzAsImFtciI6WyJ' +
                        'rYmEiLCJtZmEiLCJwd2QiXSwianRpIjoiVFJaVDdSQ2lTeW1Ucz' +
                        'VXN1J5aDMiLCJhdXRoX3RpbWUiOjE0NDk2OTYzMzB9.u7ClfS2w' +
                        '7O_kei5gtBfY_M01WCxLZ30A8KUhkHd2bDzkHFKmc3c4OT86PKS' +
                        '3I-JKeRIflXTwcIe8IUqtFGv8pM9iAT_mi2nxieMqOdrFw4S8UM' +
                        'KKgPcYLLfFCvcDs_1d0XqHHohmHKdM6YIsgP8abPk2ugwSX49Dz' +
                        'LyJrVkCZIM';

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
        oauthUtil.setupFrame(options);
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
  }

  describe('OAuth Methods', function () {

    describe('idToken.refresh', function () {
      it('returns new id_token using old id_token', function (done) {
        return oauthUtil.setupFrame({
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
              'state': oauthUtil.mockedState,
              'nonce': oauthUtil.mockedNonce,
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
        return oauthUtil.setupFrame({
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
              'state': oauthUtil.mockedState,
              'nonce': oauthUtil.mockedNonce,
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
              'state': oauthUtil.mockedState,
              'nonce': oauthUtil.mockedNonce,
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
        return oauthUtil.setupFrame({
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
          changeToHash: '#id_token=' + tokens.standardIdToken + '&state=' + oauthUtil.mockedState,
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
              'state': oauthUtil.mockedState,
              'nonce': oauthUtil.mockedNonce,
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
        return oauthUtil.setupFrame({
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
          return oauthUtil.setupFrame({
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
                'state': oauthUtil.mockedState,
                'nonce': oauthUtil.mockedNonce,
                'scope': 'openid email',
                'prompt': 'none',
                'sessionToken': 'testToken'
              }
            }
          })
          .fin(done);
        });
        it('includes specified scope in the uri', function (done) {
          return oauthUtil.setupFrame({
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
                'state': oauthUtil.mockedState,
                'nonce': oauthUtil.mockedNonce,
                'scope': 'openid testscope',
                'prompt': 'none',
                'sessionToken': 'testToken'
              }
            }
          })
          .fin(done);
        });

        it('uses the current href as the redirect_uri when it\'s not provided', function (done) {
          return oauthUtil.setupFrame({
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
                'state': oauthUtil.mockedState,
                'nonce': oauthUtil.mockedNonce,
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
              'id_token': tokens.standardIdToken,
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
              sessionToken: 'testToken',
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
              state: oauthUtil.mockedState
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
