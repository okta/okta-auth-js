/* global window, localStorage, sessionStorage */
jest.mock('cross-fetch');

var OktaAuth = require('OktaAuth');
var oauthUtil = require('../../lib/oauthUtil');
var libUtil = require('../../lib/util');
var oauthUtilHelpers = require('@okta/test.support/oauthUtil');
var util = require('@okta/test.support/util');
var wellKnown = require('@okta/test.support/xhr/well-known');
var keys = require('@okta/test.support/xhr/keys');
var tokens = require('@okta/test.support/tokens');

// Expected cookie settings. Cache will use the same settings on HTTP and HTTPS
var cookieSettings = {
  secure: false,
  sameSite: 'lax'
};

// Expected settings when testing on HTTPS protocol
var secureCookieSettings = {
  secure: true,
  sameSite: 'none'
};

describe('urlParamsToObject', () => {
  it('removes leading #/', () => {
    expect(oauthUtil.urlParamsToObject('#/foo=bar')).toEqual({
      foo: 'bar'
    });
  });
  it('removes leading #', () => {
    expect(oauthUtil.urlParamsToObject('#foo=bar')).toEqual({
      foo: 'bar'
    });
  });
  it('removes leading ?', () => {
    expect(oauthUtil.urlParamsToObject('?foo=bar')).toEqual({
      foo: 'bar'
    });
  });
  it('does not modify string if no leading char', () => {
    expect(oauthUtil.urlParamsToObject('foo=bar')).toEqual({
      foo: 'bar'
    });
  });
  it('decodes regular URI components', () => {
    const val = 'b a + & r';
    const encoded = encodeURIComponent(val);
    expect(oauthUtil.urlParamsToObject(`?foo=${encoded}`)).toEqual({
      foo: val
    });
  });
  it('does not decode id_token, access_token, or code', () => {
    const val = 'b a + & r';
    const encoded = encodeURIComponent(val);
    expect(oauthUtil.urlParamsToObject(`?foo=${encoded}&id_token=${encoded}&access_token=${encoded}&code=${encoded}`)).toEqual({
      foo: val,
      id_token: encoded,
      access_token: encoded,
      code: encoded
    });
  });
});

describe('getWellKnown', function() {
  let originalLocation;

  beforeEach(() => {
    originalLocation = window.location;
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  util.itMakesCorrectRequestResponse({
    title: 'can getWellKnown response using ORG auth server',
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
      return oauthUtil.getWellKnown(test.oa);
    },
    expectations: function (test, res) {
      expect(test.resReply.status).toEqual(200);
      expect(test.responseBody).toEqual(res);
    }
  });
  util.itMakesCorrectRequestResponse({
    title: 'can getWellKnown response using default auth server',
    setup: {
      issuer: 'https://auth-js-test.okta.com/oauth2/default',
      calls: [
        {
          request: {
            method: 'get',
            uri: '/oauth2/default/.well-known/openid-configuration'
          },
          response: 'well-known'
        }
      ],
      time: 1449699929
    },
    execute: function(test) {
      return oauthUtil.getWellKnown(test.oa);
    },
    expectations: function (test, res) {
      expect(test.resReply.status).toEqual(200);
      expect(test.responseBody).toEqual(res);
    }
  });
  util.itMakesCorrectRequestResponse({
    title: 'can getWellKnown response using custom auth server',
    setup: {
      issuer: 'https://auth-js-test.okta.com/oauth2/custom',
      calls: [
        {
          request: {
            method: 'get',
            uri: '/oauth2/custom/.well-known/openid-configuration'
          },
          response: 'well-known'
        }
      ],
      time: 1449699929
    },
    execute: function(test) {
      return oauthUtil.getWellKnown(test.oa);
    },
    expectations: function (test, res) {
      expect(test.resReply.status).toEqual(200);
      expect(test.responseBody).toEqual(res);
    }
  });
  util.itMakesCorrectRequestResponse({
    title: 'can pass an issuer',
    setup: {
      calls: [
        {
          request: {
            method: 'get',
            uri: '/oauth2/custom2/.well-known/openid-configuration'
          },
          response: 'well-known'
        }
      ],
      time: 1449699929
    },
    execute: function(test) {
      return oauthUtil.getWellKnown(test.oa, 'https://auth-js-test.okta.com/oauth2/custom2');
    },
    expectations: function (test, res) {
      expect(test.resReply.status).toEqual(200);
      expect(test.responseBody).toEqual(res);
    }
  });
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
      test.setCookieMock = util.mockSetCookie().mockReturnValue(null);
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
        '2200-01-01T00:00:00.000Z',
        cookieSettings
      );
    }
  });
  util.itMakesCorrectRequestResponse({
    title: 'caches response in secure cookie if localStorage and sessionStorage are not available on HTTPS protocol',
    setup: {
      beforeClient: function() {
        delete window.location;
        /** @type {any} */(window).location = {
          protocol: 'https:'
        }
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
      test.setCookieMock = util.mockSetCookie().mockReturnValue(null);
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
        '2200-01-01T00:00:00.000Z',
        secureCookieSettings
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
      return oauthUtil.getKey(test.oa, null, 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM');
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
      return oauthUtil.getKey(test.oa, null, 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM');
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

      return oauthUtil.getKey(test.oa, null, 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM');
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

      return oauthUtil.getKey(test.oa, null, 'invalidKid');
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
      pkce: false,
      issuer: 'https://auth-js-test.okta.com'
    });

    var result, error;
    try {
      result = oauthUtil.getOAuthUrls(sdk, options.options);
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

  it('throws if an extra options object is passed', () => {
    const sdk = new OktaAuth({
      pkce: false,
      issuer: 'https://auth-js-test.okta.com'
    });

    const f = function () {
      oauthUtil.getOAuthUrls(sdk, {}, {});
    };
    expect(f).toThrowError('As of version 3.0, "getOAuthUrls" takes only a single set of options');
  });
  
  it('defaults all urls using global defaults', function() {
    setupOAuthUrls({
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com',
        logoutUrl: 'https://auth-js-test.okta.com/oauth2/v1/logout',
        revokeUrl: 'https://auth-js-test.okta.com/oauth2/v1/revoke',
        tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
      }
    });
  });
  it('sanitizes forward slashes', function() {
    setupOAuthUrls({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com/',
        logoutUrl: 'https://auth-js-test.okta.com/oauth2/v1/logout/',
        tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token/',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize/',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo/'
      },
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com',
        logoutUrl: 'https://auth-js-test.okta.com/oauth2/v1/logout',
        revokeUrl: 'https://auth-js-test.okta.com/oauth2/v1/revoke',
        tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
      }
    });
  });
  it('overrides defaults with options', function() {
    setupOAuthUrls({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://bad.okta.com',
        logoutUrl: 'https://bad.okta.com/oauth2/v1/logout',
        revokeUrl: 'https://bad.okta.com/oauth2/v1/revoke',
        tokenUrl: 'https://bad.okta.com/oauth2/v1/token',
        authorizeUrl: 'https://bad.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://bad.okta.com/oauth2/v1/userinfo'
      },
      options: {
        issuer: 'https://auth-js-test.okta.com',
        logoutUrl: 'https://overrid-js-test.okta.com/oauth2/v1/logout',
        revokeUrl: 'https://override-js-test.okta.com/oauth2/v1/revoke',
        tokenUrl: 'https://override-js-test.okta.com/oauth2/v1/token',
        authorizeUrl: 'https://override-js-test.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://override-js-test.okta.com/oauth2/v1/userinfo'
      },
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com',
        logoutUrl: 'https://overrid-js-test.okta.com/oauth2/v1/logout',
        revokeUrl: 'https://override-js-test.okta.com/oauth2/v1/revoke',
        tokenUrl: 'https://override-js-test.okta.com/oauth2/v1/token',
        authorizeUrl: 'https://override-js-test.okta.com/oauth2/v1/authorize',
        userinfoUrl: 'https://override-js-test.okta.com/oauth2/v1/userinfo'
      }
    });
  });
  it('sanitizes options with forward slashes', function() {
    setupOAuthUrls({
      options: {
        issuer: 'https://auth-js-test.okta.com/',
        logoutUrl: 'https://auth-js-test.okta.com/oauth2/v1/logout/',
        revokeUrl: 'https://auth-js-test.okta.com/oauth2/v1/revoke/',
        tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token/',
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize/',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo/'
      },
      expectedResult: {
        issuer: 'https://auth-js-test.okta.com',
        logoutUrl: 'https://auth-js-test.okta.com/oauth2/v1/logout',
        revokeUrl: 'https://auth-js-test.okta.com/oauth2/v1/revoke',
        tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
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
        logoutUrl: 'https://auth-js-test.okta.com/oauth2/v1/logout',
        revokeUrl: 'https://auth-js-test.okta.com/oauth2/v1/revoke',
        tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
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
        logoutUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/logout',
        revokeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/revoke',
        tokenUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/token',
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
        logoutUrl: 'https://auth-js-test.okta.com/oauth2/v1/logout',
        revokeUrl: 'https://auth-js-test.okta.com/oauth2/v1/revoke',
        tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token', // we are not using this url for responseType 'token'
        authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
      }
    });
  });
});

describe('loadPopup', function() {
  it('popups window with full src url directly when none-IE', function () {
    var mockElem = /** @type {Window} */({});
    jest.spyOn(libUtil, 'isIE11OrLess').mockReturnValue(false);
    jest.spyOn(window, 'open').mockReturnValue(mockElem);

    var winEl = oauthUtil.loadPopup('/path/to/foo', {
      popupTitle: 'Hello Okta'
    });

    expect(winEl).toBe(mockElem);
    expect(/** @type {any} */(window).open.mock.calls.length).toBe(1);
    expect(window.open).toHaveBeenCalledWith(
      '/path/to/foo',
      'Hello Okta',
      'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=500, width=600, height=600'
    );
  });

  it('popups window with full src url directly and default title', function () {
    var mockElem = /** @type {Window} */({});
    jest.spyOn(libUtil, 'isIE11OrLess').mockReturnValue(false);
    jest.spyOn(window, 'open').mockReturnValue(mockElem);

    var winEl = oauthUtil.loadPopup('/path/to/foo', {});

    expect(winEl).toBe(mockElem);
    expect(/** @type {any} */(window).open.mock.calls.length).toBe(1);
    expect(window.open).toHaveBeenCalledWith(
      '/path/to/foo',
      'External Identity Provider User Authentication',
      'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=500, width=600, height=600'
    );
  });

  it('popups window with full src url directly when IE mode', function () {
    var mockElem = /** @type {Window} */({
      location: {

      }
    });
    jest.spyOn(libUtil, 'isIE11OrLess').mockReturnValue(true);
    jest.spyOn(window, 'open').mockReturnValue(mockElem);

    var winEl = oauthUtil.loadPopup('/path/to/foo', {
      popupTitle: 'Hello Okta'
    });

    expect(winEl).toBe(mockElem);
    expect(/** @type {any} */(window).open.mock.calls.length).toBe(1);
    expect(window.open).toHaveBeenCalledWith(
      '/',
      'Hello Okta',
      'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=500, width=600, height=600'
    );
    expect(winEl.location.href).toBe('/path/to/foo');
  });

});

describe('validateClaims', function () {
  var sdk;
  var validationOptions;

  beforeEach(function() {
    sdk = new OktaAuth({
      pkce: false,
      issuer: 'https://auth-js-test.okta.com',
      clientId: 'foo',
      ignoreSignature: false
    });

    validationOptions = {
      clientId: 'foo',
      issuer: 'https://auth-js-test.okta.com'
    };
  });

  it('throws an AuthSdkError when no jwt is provided', function () {
    var fn = function () { oauthUtil.validateClaims(sdk, undefined, validationOptions); };
    expect(fn).toThrowError('The jwt, iss, and aud arguments are all required');
  });

  it('throws an AuthSdkError when no clientId is provided', function () {
    var fn = function () {
      oauthUtil.validateClaims(sdk, {}, {
        issuer: 'https://auth-js-test.okta.com'
      });
    };
    expect(fn).toThrowError('The jwt, iss, and aud arguments are all required');
  });

  it('throws an AuthSdkError when no issuer is provided', function () {
    var fn = function () {
      oauthUtil.validateClaims(sdk, {}, {
        clientId: 'foo'
      });
    };
    expect(fn).toThrowError('The jwt, iss, and aud arguments are all required');
  });

  it('validates nonce, if provided', function() {
    validationOptions.nonce = 'bar';
    var claims = { nonce: 'foo' };
    var fn = function () {
      oauthUtil.validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).toThrowError('OAuth flow response nonce doesn\'t match request nonce');  
  });

  it('validates issuer', function() {
    var claims = { iss: 'foo' };
    var fn = function () {
      oauthUtil.validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).toThrowError('The issuer [' + claims.iss + '] ' +
    'does not match [' + validationOptions.issuer + ']'); 
  });

  it('validates audience', function() {
    var claims = {
      iss: validationOptions.issuer,
      aud: 'nobody'
    };
    var fn = function () {
      oauthUtil.validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).toThrowError('The audience [' + claims.aud + '] ' +
      'does not match [' + validationOptions.clientId + ']'); 
  });

  it('validates exp > iat', function() {
    var claims = {
      iss: validationOptions.issuer,
      aud: validationOptions.clientId,
      exp: 1,
      iat: 2
    };
    var fn = function () {
      oauthUtil.validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).toThrowError('The JWT expired before it was issued'); 
  });

  it('throws if expired', function() {
    var now = 10;
    util.warpToUnixTime(now);
    var claims = {
      iss: validationOptions.issuer,
      aud: validationOptions.clientId,
      exp: now - 1,
      iat: now - 2
    };
    sdk.options.maxClockSkew = 0;
    var fn = function () {
      oauthUtil.validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).toThrowError('The JWT expired and is no longer valid'); 
  });

  it('maxClockSkew extends expiration window', function() {
    var now = 10;
    var skew = 2;
    util.warpToUnixTime(now);
    var claims = {
      iss: validationOptions.issuer,
      aud: validationOptions.clientId,
      exp: now - 1,
      iat: now - 2
    };
    sdk.options.maxClockSkew = skew;
    var fn = function () {
      oauthUtil.validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).not.toThrowError();
    util.warpToUnixTime(now + skew);
    expect(fn).toThrowError('The JWT expired and is no longer valid'); 
  });

  it('throws if issued in the future', function() {
    var now = 10;
    util.warpToUnixTime(now);
    var claims = {
      iss: validationOptions.issuer,
      aud: validationOptions.clientId,
      exp: now + 2,
      iat: now + 1
    };
    sdk.options.maxClockSkew = 0;
    var fn = function () {
      oauthUtil.validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).toThrowError('The JWT was issued in the future'); 
  });

  it('maxClockSkew extends iat validation into the future', function() {
    var now = 10;
    var skew = 2;
    util.warpToUnixTime(now);
    var claims = {
      iss: validationOptions.issuer,
      aud: validationOptions.clientId,
      exp: now + 2,
      iat: now + 1
    };
    sdk.options.maxClockSkew = skew;
    var fn = function () {
      oauthUtil.validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).not.toThrowError();
    util.warpToUnixTime(now - skew);
    expect(fn).toThrowError('The JWT was issued in the future'); 
  });

  it('can validate all claims without error', function() {
    var now = 10;
    util.warpToUnixTime(now);
    var claims = {
      iss: validationOptions.issuer,
      aud: validationOptions.clientId,
      exp: now + 2,
      iat: now - 1
    };
    sdk.options.maxClockSkew = 0;
    var fn = function () {
      oauthUtil.validateClaims(sdk, claims, validationOptions);
    };
    expect(fn).not.toThrowError();
  });
});
