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
 *
 */

const mocked = {

  crossFetch: {
    __esModule: true, // fool babel require interop
    default: () => Promise.resolve({
      ok: true,
      json: () => {}
    })
  }
};

jest.mock('cross-fetch', () => {
  return mocked.crossFetch;
});

import idx from '@okta/okta-idx-js';
import { setRequestHeader } from '../../../lib/http';
import { createGlobalRequestInterceptor, setGlobalRequestInterceptor } from '../../../lib/idx/headers';

describe('idx headers', () => {

  let testContext;
  beforeEach(() => {
    testContext = {
      url: 'fake-url',
      domain: 'fake-domain',
      interactionHandle: null,
      stateHandle: 'fake-stateHandle',
      version: 'fake-version',
      sdk: {
        options: {
          httpRequestClient: () => Promise.resolve({
            responseText: null
          }),
          storageUtil: {}
        },
        storageManager: {
          getHttpCache: () => {}
        },
        _oktaUserAgent: {
          getHttpHeader: () => {
            return {
              'X-Okta-User-Agent-Extended': 'fake-sdk-user-agent'
            };
          }
        }
      }
    };
  });

  async function callIntrospect() {
    const { domain, interactionHandle, stateHandle, version } = testContext;
    await idx.introspect({ domain, interactionHandle, stateHandle, version });
  }

  describe('without interceptor', () => {
    it('idx does not use header values set in SDK options or SDK user agent', async () => {
      const { sdk } = testContext;
      sdk.options.headers = {
        'my-header': 'my-value',
        'other-header': 'other-value'
      };
      jest.spyOn(mocked.crossFetch, 'default');
      await callIntrospect();
      expect(mocked.crossFetch.default).toHaveBeenCalledWith('fake-domain/idp/idx/introspect', {
        body: JSON.stringify({
          stateToken: 'fake-stateHandle'
        }),
        credentials: 'include',
        headers: {
          'X-Okta-User-Agent-Extended': 'okta-idx-js/0.22.0',
          'accept': 'application/ion+json; okta-version=fake-version',
          'content-type': 'application/ion+json; okta-version=fake-version',
        },
        method: 'POST'
      });
    });
  
    it('idx does not use header values set using setRequestHeader or SDK user agent', async () => {
      const { sdk } = testContext;
      setRequestHeader(sdk, 'my-header', 'my-value');
      setRequestHeader(sdk, 'other-header', 'other-value');
      jest.spyOn(mocked.crossFetch, 'default');
      await callIntrospect();
      expect(mocked.crossFetch.default).toHaveBeenCalledWith('fake-domain/idp/idx/introspect', {
        body: JSON.stringify({
          stateToken: 'fake-stateHandle'
        }),
        credentials: 'include',
        headers: {
          'X-Okta-User-Agent-Extended': 'okta-idx-js/0.22.0',
          'accept': 'application/ion+json; okta-version=fake-version',
          'content-type': 'application/ion+json; okta-version=fake-version',
        },
        method: 'POST'
      });
    });
  });

  describe('with interceptor', () => {
    beforeEach(() => {
      const { sdk } = testContext;
      setGlobalRequestInterceptor(createGlobalRequestInterceptor(sdk));
    });

    it('idx uses header values set in SDK options and SDK user agent', async () => {
      const { sdk } = testContext;
      sdk.options.headers = {
        'my-header': 'my-value',
        'other-header': 'other-value'
      };
      jest.spyOn(mocked.crossFetch, 'default');
      await callIntrospect();
      expect(mocked.crossFetch.default).toHaveBeenCalledWith('fake-domain/idp/idx/introspect', {
        body: JSON.stringify({
          stateToken: 'fake-stateHandle'
        }),
        credentials: 'include',
        headers: {
          'X-Okta-User-Agent-Extended': 'fake-sdk-user-agent',
          'accept': 'application/ion+json; okta-version=fake-version',
          'content-type': 'application/ion+json; okta-version=fake-version',
          'my-header': 'my-value',
          'other-header': 'other-value'
        },
        method: 'POST'
      });
    });
  
    it('idx uses header values set using setRequestHeader and SDK user agent', async () => {
      const { sdk } = testContext;
      setRequestHeader(sdk, 'my-header', 'my-value');
      setRequestHeader(sdk, 'other-header', 'other-value');
      jest.spyOn(mocked.crossFetch, 'default');
      await callIntrospect();
      expect(mocked.crossFetch.default).toHaveBeenCalledWith('fake-domain/idp/idx/introspect', {
        body: JSON.stringify({
          stateToken: 'fake-stateHandle'
        }),
        credentials: 'include',
        headers: {
          'X-Okta-User-Agent-Extended': 'fake-sdk-user-agent',
          'accept': 'application/ion+json; okta-version=fake-version',
          'content-type': 'application/ion+json; okta-version=fake-version',
          'my-header': 'my-value',
          'other-header': 'other-value'
        },
        method: 'POST'
      });
    });

    it('idx uses header values overridden using setRequestHeader and SDK user agent', async () => {
      const { sdk } = testContext;
      sdk.options.headers = {
        'my-header': 'my-value',
        'other-header': 'other-value'
      };
      setRequestHeader(sdk, 'my-header', 'my-value2');
      setRequestHeader(sdk, 'other-header', 'other-value2');
      jest.spyOn(mocked.crossFetch, 'default');
      await callIntrospect();
      expect(mocked.crossFetch.default).toHaveBeenCalledWith('fake-domain/idp/idx/introspect', {
        body: JSON.stringify({
          stateToken: 'fake-stateHandle'
        }),
        credentials: 'include',
        headers: {
          'X-Okta-User-Agent-Extended': 'fake-sdk-user-agent',
          'accept': 'application/ion+json; okta-version=fake-version',
          'content-type': 'application/ion+json; okta-version=fake-version',
          'my-header': 'my-value2',
          'other-header': 'other-value2'
        },
        method: 'POST'
      });
    });
  });
});