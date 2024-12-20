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


declare var USER_AGENT: string; // set in jest config

import { httpRequest as originalHttpRequest } from '../../../lib/http';
import {
  OktaAuth, 
  DEFAULT_CACHE_DURATION, 
  AuthApiError, 
  STATE_TOKEN_KEY_NAME 
} from '../../../lib/exports/core';
import { setImmediate } from 'timers';


jest.mock('../../../lib/features', () => {
  return {
    isBrowser: () => typeof window !== 'undefined',
    isIE11OrLess: () => false,
    isLocalhost: () => false,
    isHTTPS: () => false,
    isIOS: () => false
  };
});

const mocked = {
  features: require('../../../lib/features'),
};

describe('HTTP Requestor', () => {
  let sdk;
  let httpRequest = originalHttpRequest;
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
  function createAuthClient(options?) {
    httpRequestClient = httpRequestClient || jest.fn().mockReturnValue(Promise.resolve({
      responseText: JSON.stringify(response1)
    }));
    sdk = new OktaAuth(Object.assign({
      issuer: 'http://my-okta-domain',
      pkce: false,
      httpRequestClient,
      tokenManager: { autoRenew: false }
    }, options));
    jest.spyOn(sdk._oktaUserAgent, 'getHttpHeader').mockImplementation(() => ({
      'X-Okta-User-Agent-Extended': USER_AGENT
    }));
  }
  describe('withCredentials', () => {
    it('can be enabled', () => {
      createAuthClient();
      return httpRequest(sdk, { url, withCredentials: true })
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
      return httpRequest(sdk, { url })
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
      return httpRequest(sdk, { url })
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
      return httpRequest(sdk, {
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
      return httpRequest(sdk, {
        url, 
        headers: {
          'fake': undefined as unknown as string
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
      return httpRequest(sdk, {
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
    it('calls oktaUserAgent.getHttpHeader to generate okta UA header', () => {
      createAuthClient();
      jest.spyOn(sdk._oktaUserAgent, 'getHttpHeader').mockImplementation(() => ({
        'X-Okta-User-Agent-Extended': 'okta-auth-js/a.b fake/x.y'
      }));
      return httpRequest(sdk, { url })
        .then(res => {
          expect(res).toBe(response1);
          expect(sdk._oktaUserAgent.getHttpHeader).toHaveBeenCalledTimes(1);
          expect(httpRequestClient).toHaveBeenCalledWith(undefined, url, {
            data: undefined,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Okta-User-Agent-Extended': `okta-auth-js/a.b fake/x.y`
            },
            withCredentials: false
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
      return httpRequest(sdk, { url, cacheResponse: true })
        .then(res => {
          expect(res).toBe(response2);
          expect(httpRequestClient).not.toHaveBeenCalled();
        });
    });
    it('will update cache', () => {
      jest.spyOn(httpCache, 'updateStorage');
      jest.spyOn(Date, 'now').mockReturnValue(1000);
      return httpRequest(sdk, { url, cacheResponse: true, method: 'GET' })
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
      return httpRequest(sdk, { url, cacheResponse: false, method: 'GET' })
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
    it('can handle Error objects', () => {
      const errMessage = 'Failed to execute \'fetch\' on \'Window\': Failed to parse URL from http://localhost:3000:1802/some_endpoint';
      const response = new TypeError(errMessage);
      initWithErrorResponse(response);
      createAuthClient();
      return httpRequest(sdk, { url })
        .catch(err => {
          expect(err).toBeInstanceOf(AuthApiError);
          expect(err.errorSummary).toEqual(errMessage);
          expect(err.xhr).toEqual(undefined);
        });
    });
    it('handles string errors', () => {
      const response = { responseText: 'fake error', status: 404 };
      initWithErrorResponse(response);
      createAuthClient();
      return httpRequest(sdk, { url })
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
      return httpRequest(sdk, { url })
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
      return httpRequest(sdk, { url })
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
      return httpRequest(sdk, { url })
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
      return httpRequest(sdk, { url })
        .catch(err => {
          expect(err).toBeInstanceOf(AuthApiError);
          expect(err.xhr).toEqual(response);
          expect(storage.delete).toHaveBeenCalledWith(STATE_TOKEN_KEY_NAME);
        });
    });
    it('can handle insufficient_authentication error when has "insufficient_authentication_context" in www-authenticate header', () => {
      const response = {
        status: 403,
        headers: {
          'www-authenticate': 'Bearer realm="IdpMyAccountAPI", error="insufficient_authentication_context", error_description="The access token requires additional assurance to access the resource", max_age=900, acr_values="urn:okta:loa:2fa:any:ifpossible"'
        }
      };
      initWithErrorResponse(response);
      createAuthClient();
      return httpRequest(sdk, { url })
        .catch(err => {
          expect(err).toBeInstanceOf(AuthApiError);
          expect(err.errorSummary).toBe('insufficient_authentication_context');
          expect(err.errorCauses).toEqual([{ errorSummary: 'The access token requires additional assurance to access the resource' }]);
          expect(err.meta.max_age).toEqual(900);
          expect(err.meta.acr_values).toEqual('urn:okta:loa:2fa:any:ifpossible');
        });
    });

    // TODO: OAuthError includes response object
  });

  // eslint-disable-next-line no-extra-boolean-cast
  (!!global.document ? describe : describe.skip)('iOS18 polling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      // Simulate iOS and reload `request.ts` module
      jest.resetModules();
      jest.mock('../../../lib/features', () => {
        return {
          ...mocked.features,
          isIOS: () => true 
        };
      });
      const { httpRequest: reloadedHttpRequest } = jest.requireActual('../../../lib/http');
      httpRequest = reloadedHttpRequest;
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
      httpRequest = originalHttpRequest;
      jest.mock('../../../lib/features', () => {
        return {
          ...mocked.features,
          isIOS: () => false 
        };
      });
    });

    const togglePageVisibility = () => {
      (document as any).hidden = !document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    };

    const advanceTestTimers = async (ms?: number) => {
      // see https://stackoverflow.com/a/52196951 for more info about jest/promises/timers
      if (ms) {
        jest.advanceTimersByTime(ms);
      } else {
        jest.runOnlyPendingTimers();
      }
      // flushes promise queue
      return new Promise(resolve => setImmediate(resolve));
    };

    it('should wait for awaken document for 500 ms before making request', async () => {
      createAuthClient();
      expect(document.hidden).toBe(false);

      // Document is hidden
      togglePageVisibility();
      const requestPromise = httpRequest(sdk, {
        url,
        pollingIntent: true,
      });
      await advanceTestTimers();
      expect(httpRequestClient).toHaveBeenCalledTimes(0);

      // Document is visible for 200 ms
      togglePageVisibility();
      await advanceTestTimers(200);
      expect(httpRequestClient).toHaveBeenCalledTimes(0);

      // Document is visible for 600 ms
      await advanceTestTimers(400);
      expect(httpRequestClient).toHaveBeenCalledTimes(1);
      expect(httpRequestClient).toHaveBeenCalledWith(undefined, url, {
        data: undefined,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Okta-User-Agent-Extended': USER_AGENT
        },
        withCredentials: false
      });
      const res = await requestPromise;
      expect(res).toBe(response1);
    });
  });
});