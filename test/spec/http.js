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


/* global USER_AGENT */

import http from '../../lib/http';
import { 
  OktaAuth, 
  DEFAULT_CACHE_DURATION, 
  AuthApiError, 
  STATE_TOKEN_KEY_NAME 
} from '../../lib';

describe('HTTP Requestor', () => {
  let sdk;
  let httpRequestClient;
  let url;
  let response1;
  let response2;

  beforeEach(() => {
    url = 'http://my-fake-url';
    response1 = 'my fake response 1';
    response2 = 'my fake response 2';
  });
  afterEach(() => {
    sdk = null;
    httpRequestClient = null;
  });
  function createAuthClient(options) {
    httpRequestClient = httpRequestClient || jest.fn().mockReturnValue(Promise.resolve({
      responseText: JSON.stringify(response1)
    }));
    sdk = new OktaAuth(Object.assign({
      issuer: 'http://my-okta-domain',
      pkce: false,
      httpRequestClient,
      tokenManager: { autoRenew: false }
    }, options));
  }
  describe('withCredentials', () => {
    it('can be enabled', () => {
      createAuthClient();
      return http.httpRequest(sdk, { url, withCredentials: true })
      .then(res => {
        expect(res).toBe(response1);
        expect(httpRequestClient).toHaveBeenCalledWith(undefined, url, {
          data: undefined,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': USER_AGENT
          },
          withCredentials: true
        });
      });
    });
  });
  describe('headers', () => {
    it('sets defaults', () => {
      createAuthClient();
      return http.httpRequest(sdk, { url })
      .then(res => {
        expect(res).toBe(response1);
        expect(httpRequestClient).toHaveBeenCalledWith(undefined, url, {
          data: undefined,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': USER_AGENT
          },
          withCredentials: false
        });
      });
    });
    it('accepts headers on sdk instance', () => {
      createAuthClient({
        headers: {
          'fake': 'value'
        }
      });
      return http.httpRequest(sdk, { url })
      .then(res => {
        expect(res).toBe(response1);
        expect(httpRequestClient).toHaveBeenCalledWith(undefined, url, {
          data: undefined,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': USER_AGENT,
            'fake': 'value'
          },
          withCredentials: false
        });
      });
    });
    it('accepts headers on httpRequest', () => {
      createAuthClient();
      return http.httpRequest(sdk, {
        url, 
        headers: {
          'fake': 'value'
        }
      })
      .then(res => {
        expect(res).toBe(response1);
        expect(httpRequestClient).toHaveBeenCalledWith(undefined, url, {
          data: undefined,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': USER_AGENT,
            'fake': 'value'
          },
          withCredentials: false
        });
      });
    });
    it('removes headers with undefined value', () => {
      createAuthClient();
      return http.httpRequest(sdk, {
        url, 
        headers: {
          'fake': undefined
        }
      })
      .then(res => {
        expect(res).toBe(response1);
        expect(httpRequestClient).toHaveBeenCalledWith(undefined, url, {
          data: undefined,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': USER_AGENT
          },
          withCredentials: false
        });
      });
    });
    it('can set an Authorization header using accessToken', () => {
      createAuthClient();
      return http.httpRequest(sdk, {
        url, 
        accessToken: 'fake'
      })
      .then(res => {
        expect(res).toBe(response1);
        expect(httpRequestClient).toHaveBeenCalledWith(undefined, url, {
          data: undefined,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': USER_AGENT,
            'Authorization': 'Bearer fake'
          },
          withCredentials: false
        });
      });
    });
    describe('customize okta user agent', () => {
      let sdkVersion;
      beforeEach(async () => {
        sdkVersion = (await import('../../package.json')).version;
        createAuthClient();
      });
      describe('browser env', () => {
        beforeEach(() => {
          jest.spyOn(sdk.features, 'isBrowser').mockReturnValue(true);
        });
        it('can add extra environment', () => {
          sdk._oktaUserAgent.addEnvironment('fake/x.y');
          return http.httpRequest(sdk, { url })
            .then(res => {
              expect(res).toBe(response1);
              expect(httpRequestClient).toHaveBeenCalledWith(undefined, url, {
                data: undefined,
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'X-Okta-User-Agent-Extended': `okta-auth-js/${sdkVersion} fake/x.y`
                },
                withCredentials: false
              });
            });
        });
      });
      describe('node env', () => {
        let nodeVersion = process.versions.node;
        beforeEach(() => {
          jest.spyOn(sdk.features, 'isBrowser').mockReturnValue(false);
        });
        it('should attach node info to the end of Okta UA header', () => {
          return http.httpRequest(sdk, { url })
            .then(res => {
              expect(res).toBe(response1);
              expect(httpRequestClient).toHaveBeenCalledWith(undefined, url, {
                data: undefined,
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'X-Okta-User-Agent-Extended': `okta-auth-js/${sdkVersion} nodejs/${nodeVersion}`
                },
                withCredentials: false
              });
            });
        });
        it('can add extra environment', () => {
          sdk._oktaUserAgent.addEnvironment('fake/x.y');
          return http.httpRequest(sdk, { url })
            .then(res => {
              expect(res).toBe(response1);
              expect(httpRequestClient).toHaveBeenCalledWith(undefined, url, {
                data: undefined,
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'X-Okta-User-Agent-Extended': `okta-auth-js/${sdkVersion} fake/x.y nodejs/${nodeVersion}`
                },
                withCredentials: false
              });
            });
        });
      });
    });
  });
  describe('cacheResponse', () => {
    let httpCache;
    beforeEach(() => {
      createAuthClient();
      httpCache = sdk.storageManager.getHttpCache(sdk.options.cookies);
      jest.spyOn(sdk.storageManager, 'getHttpCache').mockReturnValue(httpCache); // force same object on each call
    });
    afterEach(() => {
      httpCache.clearStorage();
    });
    it('can return a cached response', () => {
      httpCache.updateStorage(url, {
        expiresAt: Math.floor(Date.now()/1000) + DEFAULT_CACHE_DURATION,
        response: response2
      });
      return http.httpRequest(sdk, { url, cacheResponse: true })
        .then(res => {
          expect(res).toBe(response2);
          expect(httpRequestClient).not.toHaveBeenCalled();
        });
    });
    it('will update cache', () => {
      jest.spyOn(httpCache, 'updateStorage');
      jest.spyOn(Date, 'now').mockReturnValue(1000);
      return http.httpRequest(sdk, { url, cacheResponse: true, method: 'GET' })
        .then(res => {
          expect(res).toBe(response1);
          expect(httpRequestClient).toHaveBeenCalledWith('GET', url, expect.any(Object));
          expect(httpCache.updateStorage).toHaveBeenCalledWith(url, {
            expiresAt: 1 + DEFAULT_CACHE_DURATION,
            response: response1
          });
        });
    });
    it('cache can be disabled', () => {
      jest.spyOn(httpCache, 'updateStorage');
      httpCache.updateStorage(url, {
        expiresAt: Math.floor(Date.now()/1000) + DEFAULT_CACHE_DURATION,
        response: response2
      });
      httpCache.updateStorage.mockClear();
      return http.httpRequest(sdk, { url, cacheResponse: false, method: 'GET' })
        .then(res => {
          expect(res).toBe(response1);
          expect(httpRequestClient).toHaveBeenCalledWith('GET', url, expect.any(Object));
          expect(httpCache.updateStorage).not.toHaveBeenCalled();
        });
    });
  });
  describe('error handling', () => {
    function initWithErrorResponse(response) {
      httpRequestClient = jest.fn().mockReturnValue(Promise.reject(response));
    }
    it('handles string errors', () => {
      const response = { responseText: 'fake error', status: 404 };
      initWithErrorResponse(response);
      createAuthClient();
      return http.httpRequest(sdk, { url })
        .catch(err => {
          expect(err).toBeInstanceOf(AuthApiError);
          expect(err.errorSummary).toBe('Unknown error');
          expect(err.xhr).toEqual(response);
        });
    });
    it('handles JSON errors', () => {
      const json = { errorSummary: 'fake error' };
      const response = { responseText: JSON.stringify(json), status: 404 };
      initWithErrorResponse(response);
      createAuthClient();
      return http.httpRequest(sdk, { url })
        .catch(err => {
          expect(err).toBeInstanceOf(AuthApiError);
          expect(err.xhr).toEqual(response);
          expect(err.errorSummary).toBe('fake error');
        });
    });
    it('sets errorSummary to "Unknown error" on 50x errors', () => {
      const json = { errorSummary: '501 error' };
      const response = { responseText: JSON.stringify(json), status: 501 };
      initWithErrorResponse(response);
      createAuthClient();
      return http.httpRequest(sdk, { url })
        .catch(err => {
          expect(err).toBeInstanceOf(AuthApiError);
          expect(err.xhr).toEqual(response);
          expect(err.errorSummary).toBe('Unknown error');
        });
    });
    it('can transform the error XHR with "transformErrorXHR" option', () => {
      const json = { errorCode: 'original error' };
      const response = { responseText: JSON.stringify(json), status: 501 };
      initWithErrorResponse(response);
      const transformErrorXHR = jest.fn().mockImplementation(xhr => {
        xhr.status = 404;
        return xhr;
      });
      createAuthClient({
        transformErrorXHR
      });
      return http.httpRequest(sdk, { url })
        .catch(err => {
          expect(err).toBeInstanceOf(AuthApiError);
          expect(err.xhr).toEqual({
            responseText: '{"errorCode":"original error"}',
            status: 404
          });
          expect(err.errorCode).toBe('original error');
        });
    });
    it('will delete state token if receives error "E0000011"', () => {
      const json = { errorCode: 'E0000011' };
      const response = { responseText: JSON.stringify(json), status: 403 };
      initWithErrorResponse(response);
      createAuthClient();
      const storage = sdk.options.storageUtil.storage;
      jest.spyOn(storage, 'delete');
      return http.httpRequest(sdk, { url })
        .catch(err => {
          expect(err).toBeInstanceOf(AuthApiError);
          expect(err.xhr).toEqual(response);
          expect(storage.delete).toHaveBeenCalledWith(STATE_TOKEN_KEY_NAME);
        });
    });
  });
});