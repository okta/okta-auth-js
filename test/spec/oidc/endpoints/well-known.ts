/* global window, localStorage, sessionStorage */
jest.mock('cross-fetch');

import { getWellKnown, getKey } from '../../../../lib/oidc/endpoints/well-known';
import oauthUtilHelpers from '@okta/test.support/oauthUtil';
import util from '@okta/test.support/util';
import wellKnown from '@okta/test.support/xhr/well-known';
import keys from '@okta/test.support/xhr/keys';
import tokens from '@okta/test.support/tokens';

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
      return getWellKnown(test.oa);
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
      return getWellKnown(test.oa);
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
      return getWellKnown(test.oa);
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
      return getWellKnown(test.oa, 'https://auth-js-test.okta.com/oauth2/custom2');
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
      return getWellKnown(test.oa)
      .then(function() {
        return getWellKnown(test.oa);
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
      return getWellKnown(test.oa);
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
      return getWellKnown(test.oa);
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
      return getWellKnown(test.oa);
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
      return getWellKnown(test.oa);
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
        window.location = {
          protocol: 'https:'
        } as unknown as Location;
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
      return getWellKnown(test.oa);
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
      oauthUtilHelpers.loadWellKnownAndKeysCache(test.oa);
      return getKey(test.oa, null, 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM');
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
      return getKey(test.oa, null, 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM');
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

      return getKey(test.oa, null, 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM');
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

      return getKey(test.oa, null, 'invalidKid');
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