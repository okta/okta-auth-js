var OktaAuth = require('OktaAuth');
var oauthUtil = require('../../lib/oauthUtil');
var libUtil = require('../../lib/util');
var oauthUtilHelpers = require('../util/oauthUtil');
var util = require('../util/util');
var wellKnown = require('../xhr/well-known');
var keys = require('../xhr/keys');
var tokens = require('../util/tokens');

describe('getWellKnown', function() {
  util.itMakesCorrectRequestResponse({
    title: 'caches response and uses cache on subsequent requests',
    setup: {
      calls: [
        {
          request: {
            method: 'get',
            uri: '/.well-known/openid-configuration'
          },
          response: 'well-known'
        }
      ],
      time: 1449699929
    },
    execute: function(test) {
      localStorage.clear();
      return oauthUtil.getWellKnown(test.oa)
      .then(function() {
        return oauthUtil.getWellKnown(test.oa);
      });
    },
    expectations: function() {
      var cache = localStorage.getItem('okta-cache-storage');
      expect(cache).toEqual(JSON.stringify({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnown.response
        }
      }));
    }
  });
  util.itMakesCorrectRequestResponse({
    title: 'uses cached response',
    setup: {
      time: 1449699929
    },
    execute: function(test) {
      localStorage.setItem('okta-cache-storage', JSON.stringify({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnown.response
        }
      }));
      return oauthUtil.getWellKnown(test.oa);
    },
    expectations: function() {
      var cache = localStorage.getItem('okta-cache-storage');
      expect(cache).toEqual(JSON.stringify({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnown.response
        }
      }));
    }
  });
  util.itMakesCorrectRequestResponse({
    title: 'doesn\'t use cached response if past cache expiration',
    setup: {
      calls: [
        {
          request: {
            method: 'get',
            uri: '/.well-known/openid-configuration'
          },
          response: 'well-known'
        }
      ],
      time: 1450000000
    },
    execute: function(test) {
      localStorage.setItem('okta-cache-storage', JSON.stringify({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnown.response
        }
      }));
      return oauthUtil.getWellKnown(test.oa);
    },
    expectations: function() {
      var cache = localStorage.getItem('okta-cache-storage');
      expect(cache).toEqual(JSON.stringify({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1450086400,
          response: wellKnown.response
        }
      }));
    }
  });
  util.itMakesCorrectRequestResponse({
    title: 'caches response in sessionStorage if localStorage isn\'t available',
    setup: {
      beforeClient: function() {
        oauthUtilHelpers.mockLocalStorageError();
      },
      calls: [
        {
          request: {
            method: 'get',
            uri: '/.well-known/openid-configuration'
          },
          response: 'well-known'
        }
      ],
      time: 1449699929
    },
    execute: function(test) {
      sessionStorage.clear();
      return oauthUtil.getWellKnown(test.oa);
    },
    expectations: function() {
      var cache = sessionStorage.getItem('okta-cache-storage');
      expect(cache).toEqual(JSON.stringify({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnown.response
        }
      }));
    }
  });
  util.itMakesCorrectRequestResponse({
    title: 'caches response in cookie if localStorage and sessionStorage are not available',
    setup: {
      beforeClient: function() {
        oauthUtilHelpers.mockLocalStorageError();
        oauthUtilHelpers.mockSessionStorageError();
      },
      calls: [
        {
          request: {
            method: 'get',
            uri: '/.well-known/openid-configuration'
          },
          response: 'well-known'
        }
      ],
      time: 1449699929
    },
    execute: function(test) {
      test.setCookieMock = util.mockSetCookie();
      return oauthUtil.getWellKnown(test.oa);
    },
    expectations: function(test) {
      expect(test.setCookieMock).toHaveBeenCalledWith(
        'okta-cache-storage',
        JSON.stringify({
          'https://auth-js-test.okta.com/.well-known/openid-configuration': {
            expiresAt: 1449786329,
            response: wellKnown.response
          }
        }),
        '2038-01-19T03:14:07.000Z'
      );
    }
  });
});

describe('getKey', function() {
  util.itMakesCorrectRequestResponse({
    title: 'uses existing jwks on valid kid',
    setup: {
      time: 1449699929
    },
    execute: function(test) {
      oauthUtilHelpers.loadWellKnownAndKeysCache();
      return oauthUtil.getKey(test.oa, test.oa.options.url, 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM');
    },
    expectations: function(test, key) {
      expect(key).toEqual(tokens.standardKey);
    }
  });
  util.itMakesCorrectRequestResponse({
    title: 'pulls new jwks on valid kid',
    setup: {
      calls: [
        {
          request: {
            method: 'get',
            uri: '/oauth2/v1/keys'
          },
          response: 'keys'
        }
      ],
      time: 1449699929
    },
    execute: function(test) {
      oauthUtilHelpers.loadWellKnownCache();
      return oauthUtil.getKey(test.oa, test.oa.options.url, 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM');
    },
    expectations: function(test, key) {
      expect(key).toEqual(tokens.standardKey);
      var cache = localStorage.getItem('okta-cache-storage');
      expect(cache).toEqual(JSON.stringify({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnown.response
        },
        'https://auth-js-test.okta.com/oauth2/v1/keys': {
          expiresAt: 1449786329,
          response: keys.response
        }
      }));
    }
  });

  util.itMakesCorrectRequestResponse({
    title: 'checks existing jwks then pulls new jwks on valid kid',
    setup: {
      calls: [
        {
          request: {
            method: 'get',
            uri: '/oauth2/v1/keys'
          },
          response: 'keys'
        }
      ],
      time: 1449699929
    },
    execute: function(test) {
      // Put a modified kid in the cache
      localStorage.setItem('okta-cache-storage', JSON.stringify({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnown.response
        },
        'https://auth-js-test.okta.com/oauth2/v1/keys': {
          expiresAt: 1449786329,
          response: {
            'keys': [{
              alg: 'RS256',
              kty: 'RSA',
              n: 'fake',
              e: 'AQAB',
              use: 'sig',
              kid: 'modifiedKeyId'
            }]
          }
        }
      }));

      return oauthUtil.getKey(test.oa, test.oa.options.url, 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM');
    },
    expectations: function(test, key) {
      expect(key).toEqual(tokens.standardKey);
      var cache = localStorage.getItem('okta-cache-storage');
      expect(cache).toEqual(JSON.stringify({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnown.response
        },
        'https://auth-js-test.okta.com/oauth2/v1/keys': {
          expiresAt: 1449786329,
          response: keys.response
        }
      }));
    }
  });

  util.itErrorsCorrectly({
    title: 'checks existing jwks then pulls new jwks on invalid kid',
    setup: {
      calls: [
        {
          request: {
            method: 'get',
            uri: '/oauth2/v1/keys'
          },
          response: 'keys'
        }
      ],
      time: 1449699929
    },
    execute: function(test) {
      // Put a modified kid in the cache
      localStorage.setItem('okta-cache-storage', JSON.stringify({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnown.response
        },
        'https://auth-js-test.okta.com/oauth2/v1/keys': {
          expiresAt: 1449786329,
          response: keys.response
        }
      }));

      return oauthUtil.getKey(test.oa, test.oa.options.url, 'invalidKid');
    },
    expectations: function(test, err) {
      util.assertAuthSdkError(err, 'The key id, invalidKid, was not found in the server\'s keys');
      var cache = localStorage.getItem('okta-cache-storage');
      expect(cache).toEqual(JSON.stringify({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnown.response
        },
        'https://auth-js-test.okta.com/oauth2/v1/keys': {
          expiresAt: 1449786329,
          response: keys.response
        }
      }));
    }
  });
});

describe('getOAuthUrls', function() {
  function setupOAuthUrls(options) {
    var sdk = new OktaAuth(options.oktaAuthArgs || {
      url: 'https://auth-js-test.okta.com'
    });

    var oauthParams = options.oauthParams || {
      responseType: 'id_token'
    };

    var result, error;
    try {
      result = oauthUtil.getOAuthUrls(sdk, oauthParams, options.options);
    } catch(e) {
      error = e;
    }

    if (options.expectedResult) {
      expect(result).toEqual(options.expectedResult);
    }

    if (options.expectedError) {
      expect(error.name).toEqual(options.expectedError.name);
      expect(error.message).toEqual(options.expectedError.message);
      expect(error.errorCode).toEqual('INTERNAL');
      expect(error.errorSummary).toEqual(options.expectedError.message);
      expect(error.errorLink).toEqual('INTERNAL');
      expect(error.errorId).toEqual('INTERNAL');
      expect(error.errorCauses).toEqual([]);
    }
  }

  it('defaults all urls using global defaults', function() {
    setupOAuthUrls({
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
      }
    });
  });
  it('sanitizes forward slashes', function() {
    setupOAuthUrls({
      oktaAuthArgs: {
        url: 'https://auth-js-test.okta.com',
        issuer: 'https://auth-js-test.okta.com/',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize/',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo/'
      },
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
      }
    });
  });
  it('overrides defaults with options', function() {
    setupOAuthUrls({
      oktaAuthArgs: {
        url: 'https://auth-js-test.okta.com',
        issuer: 'https://bad.okta.com',
        authorizeUrl: 'https://bad.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://bad.okta.com/oauth2/v1/userinfo'
      },
      options: {
        issuer: 'https://auth-js-test.okta.com',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
      },
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
      }
    });
  });
  it('sanitizes options with forward slashes', function() {
    setupOAuthUrls({
      options: {
        issuer: 'https://auth-js-test.okta.com/',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize/',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo/'
      },
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
      }
    });
  });
  it('uses issuer to generate authorizeUrl and userinfoUrl', function() {
    setupOAuthUrls({
      options: {
        issuer: 'https://auth-js-test.okta.com'
      },
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
      }
    });
  });
  it('uses authServer issuer to generate authorizeUrl and userinfoUrl', function() {
    setupOAuthUrls({
      options: {
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7'
      },
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
      }
    });
  });
  it('uses authServer issuer as authServerId to generate authorizeUrl and userinfoUrl', function() {
    setupOAuthUrls({
      options: {
        issuer: 'aus8aus76q8iphupD0h7'
      },
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
      }
    });
  });
  it('allows token requested with only authorizeUrl and userinfoUrl', function() {
    setupOAuthUrls({
      oauthParams: {
        responseType: 'token'
      },
      options: {
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
      },
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com', // We don't validate the issuer of access tokens, so this is ignored
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
      }
    });
  });
  it('fails if id_token requested without issuer, with authorizeUrl', function() {
    setupOAuthUrls({
      oauthParams: {
        responseType: 'id_token'
      },
      options: {
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize'
      },
      expectedError: {
        name: 'AuthSdkError',
        message: 'Cannot request idToken with an authorizeUrl without an issuer'
      }
    });
  });
  it('fails if token requested without issuer, without userinfoUrl, with authorizeUrl', function() {
    setupOAuthUrls({
      oauthParams: {
        responseType: 'token'
      },
      options: {
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize'
      },
      expectedError: {
        name: 'AuthSdkError',
        message: 'Cannot request accessToken with an authorizeUrl without an issuer or userinfoUrl'
      }
    });
  });
  it('fails if token requested without issuer, without authorizeUrl, with userinfoUrl', function() {
    setupOAuthUrls({
      oauthParams: {
        responseType: 'id_token'
      },
      options: {
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
      },
      expectedError: {
        name: 'AuthSdkError',
        message: 'Cannot request token with an userinfoUrl without an issuer or authorizeUrl'
      }
    });
  });
});

describe('loadPopup', function() {
  it('popups window with full src url directly when none-IE', function () {
    var mockElem = {};
    jest.spyOn(libUtil, 'isIE11OrLess').mockReturnValue(false);
    jest.spyOn(window, 'open').mockReturnValue(mockElem);

    var winEl = oauthUtil.loadPopup('/path/to/foo', {
      popupTitle: 'Hello Okta'
    });

    expect(winEl).toBe(mockElem);
    expect(window.open.mock.calls.length).toBe(1);
    expect(window.open).toHaveBeenCalledWith(
      '/path/to/foo',
      'Hello Okta',
      'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=500, width=600, height=600'
    );
  });

  it('popups window with full src url directly and default title', function () {
    var mockElem = {};
    jest.spyOn(libUtil, 'isIE11OrLess').mockReturnValue(false);
    jest.spyOn(window, 'open').mockReturnValue(mockElem);

    var winEl = oauthUtil.loadPopup('/path/to/foo', {});

    expect(winEl).toBe(mockElem);
    expect(window.open.mock.calls.length).toBe(1);
    expect(window.open).toHaveBeenCalledWith(
      '/path/to/foo',
      'External Identity Provider User Authentication',
      'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=500, width=600, height=600'
    );
  });

  it('popups window with full src url directly when IE mode', function () {
    var mockElem = {
      location: {

      }
    };
    jest.spyOn(libUtil, 'isIE11OrLess').mockReturnValue(true);
    jest.spyOn(window, 'open').mockReturnValue(mockElem);

    var winEl = oauthUtil.loadPopup('/path/to/foo', {
      popupTitle: 'Hello Okta'
    });

    expect(winEl).toBe(mockElem);
    expect(window.open.mock.calls.length).toBe(1);
    expect(window.open).toHaveBeenCalledWith(
      '/',
      'Hello Okta',
      'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=500, width=600, height=600'
    );
    expect(winEl.location.href).toBe('/path/to/foo');
  });

});

describe('validateClaims', function () {
  var sdk = new OktaAuth({
    url: 'https://auth-js-test.okta.com',
    clientId: 'foo',
    ignoreSignature: false
  });

  var validationOptions = {
    clientId: 'foo',
    issuer: 'https://auth-js-test.okta.com'
  };

  it('throws an AuthSdkError when no jwt is provided', function () {
    var fn = function () { oauthUtil.validateClaims(sdk, undefined, validationOptions); };
    expect(fn).toThrowError('The jwt, iss, and aud arguments are all required');
  });

  it('throws an AuthSdkError when no clientId is provided', function () {
    var fn = function () {
      oauthUtil.validateClaims(sdk, undefined, {
        issuer: 'https://auth-js-test.okta.com'
      });
    };
    expect(fn).toThrowError('The jwt, iss, and aud arguments are all required');
  });

  it('throws an AuthSdkError when no issuer is provided', function () {
    var fn = function () {
      oauthUtil.validateClaims(sdk, undefined, {
        clientId: 'foo'
      });
    };
    expect(fn).toThrowError('The jwt, iss, and aud arguments are all required');
  });
});
