/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


/* global sessionStorage */
const mocked = {
  features: {
    isHTTPS: () => false,
    isBrowser: () => typeof window !== 'undefined',
    isIE11OrLess: () => false,
    isLocalhost: () => false,
    isMobileSafari18: () => false
  }
};
jest.mock('../../../../lib/features', () => {
  return mocked.features;
});

import { getWellKnown, getKey } from '../../../../lib/oidc/endpoints/well-known';
import oauthUtilHelpers from '@okta/test.support/oauthUtil';
import util from '@okta/test.support/util';
import wellKnown from '@okta/test.support/xhr/well-known';
import keys from '@okta/test.support/xhr/keys';
import tokens from '@okta/test.support/tokens';

const headers = {
  'Content-Type': 'application/json'
};
const wellKnownResponse = {
  ...wellKnown.response,
  headers
};
const keysResponse = {
  ...keys.response,
  headers
};

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
    expectations: function (test, res, resp) {
      expect(test.resReply.status).toEqual(200);
      expect(resp).toEqual(res);
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
    expectations: function (test, res, resp) {
      expect(test.resReply.status).toEqual(200);
      expect(resp).toEqual(res);
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
    expectations: function (test, res, resp) {
      expect(test.resReply.status).toEqual(200);
      expect(resp).toEqual(res);
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
    expectations: function (test, res, resp) {
      expect(test.resReply.status).toEqual(200);
      expect(resp).toEqual(res);
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
      test.oa.storageManager.getHttpCache().setStorage({});
      return getWellKnown(test.oa)
      .then(function() {
        return getWellKnown(test.oa);
      });
    },
    expectations: function(test) {
      var cache = test.oa.storageManager.getHttpCache().getStorage();
      expect(cache).toEqual({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnownResponse
        }
      });
    }
  });
  util.itMakesCorrectRequestResponse({
    title: 'uses cached response',
    setup: {
      time: 1449699929
    },
    execute: function(test) {
      var storage = test.oa.storageManager.getHttpCache();
      storage.setStorage({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnownResponse
        }
      });
      return getWellKnown(test.oa);
    },
    expectations: function(test) {
      var cache = test.oa.storageManager.getHttpCache().getStorage();
      expect(cache).toEqual({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnownResponse
        }
      });
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
      var storage = test.oa.storageManager.getHttpCache();
      storage.setStorage({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnownResponse
        }
      });
      return getWellKnown(test.oa);
    },
    expectations: function(test) {
      var cache = test.oa.storageManager.getHttpCache().getStorage();
      expect(cache).toEqual({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1450086400,
          response: wellKnownResponse
        }
      });
    }
  });

  describe('browser', () => {
    if (typeof window === 'undefined') {
      return;
    }

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
            response: wellKnownResponse
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
              response: wellKnownResponse
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
          jest.spyOn(mocked.features, 'isHTTPS').mockReturnValue(true);
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
              response: wellKnownResponse
            }
          }),
          '2200-01-01T00:00:00.000Z',
          secureCookieSettings
        );
      }
    });
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
      return getKey(test.oa, '', 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM');
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
      var storage = test.oa.storageManager.getHttpCache();
      storage.setStorage({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnownResponse
        }
      });
      return getKey(test.oa, '', 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM');
    },
    expectations: function(test, key) {
      expect(key).toEqual(tokens.standardKey);
      var cache = test.oa.storageManager.getHttpCache().getStorage();
      expect(cache).toEqual({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnownResponse
        },
        'https://auth-js-test.okta.com/oauth2/v1/keys': {
          expiresAt: 1449786329,
          response: keysResponse
        }
      });
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
      var storage = test.oa.storageManager.getHttpCache();
      storage.setStorage({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnownResponse
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
            }],
            'headers': headers
          }
        }
      });

      return getKey(test.oa, '', 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM');
    },
    expectations: function(test, key) {
      expect(key).toEqual(tokens.standardKey);
      var cache = test.oa.storageManager.getHttpCache().getStorage();
      expect(cache).toEqual({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnownResponse
        },
        'https://auth-js-test.okta.com/oauth2/v1/keys': {
          expiresAt: 1449786329,
          response: keysResponse
        }
      });
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
      var storage = test.oa.storageManager.getHttpCache();
      storage.setStorage({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnownResponse
        },
        'https://auth-js-test.okta.com/oauth2/v1/keys': {
          expiresAt: 1449786329,
          response: keysResponse
        }
      });

      return getKey(test.oa, '', 'invalidKid');
    },
    expectations: function(test, err) {
      util.assertAuthSdkError(err, 'The key id, invalidKid, was not found in the server\'s keys');
      var cache = test.oa.storageManager.getHttpCache().getStorage();
      expect(cache).toEqual({
        'https://auth-js-test.okta.com/.well-known/openid-configuration': {
          expiresAt: 1449786329,
          response: wellKnownResponse
        },
        'https://auth-js-test.okta.com/oauth2/v1/keys': {
          expiresAt: 1449786329,
          response: keysResponse
        }
      });
    }
  });
});