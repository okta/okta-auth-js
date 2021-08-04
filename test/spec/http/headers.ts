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

import { httpRequest, setRequestHeader } from '../../../lib/http';

describe('HTTP headers', () => {
  let testContext;
  beforeEach(() => {
    testContext = {
      url: 'fake-url',
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
          getHttpHeader: () => {}
        }
      }
    };
  });

  it('uses header values set in SDK options', async () => {
    const { sdk, url } = testContext;
    sdk.options.headers = {
      'my-header': 'my-value',
      'other-header': 'other-value'
    };
    jest.spyOn(sdk.options, 'httpRequestClient');
    await httpRequest(sdk, { url, method: 'get' });
    expect(sdk.options.httpRequestClient).toHaveBeenCalledWith('get', 'fake-url', {
      data: undefined,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'my-header': 'my-value',
        'other-header': 'other-value'
      },
      withCredentials: false
    });
  });

  it('uses header values set using setRequestHeader', async () => {
    const { sdk, url } = testContext;
    jest.spyOn(sdk.options, 'httpRequestClient');
    setRequestHeader(sdk, 'my-header', 'my-value');
    setRequestHeader(sdk, 'other-header', 'other-value');
    await httpRequest(sdk, { url, method: 'get' });
    expect(sdk.options.httpRequestClient).toHaveBeenCalledWith('get', 'fake-url', {
      data: undefined,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'my-header': 'my-value',
        'other-header': 'other-value'
      },
      withCredentials: false
    });
  });

  it('can override header values set in options using setRequestHeader', async () => {
    const { sdk, url } = testContext;
    jest.spyOn(sdk.options, 'httpRequestClient');
    sdk.options.headers = {
      'my-header': 'my-value',
      'other-header': 'other-value'
    };
    setRequestHeader(sdk, 'my-header', 'my-value2');
    setRequestHeader(sdk, 'other-header', 'other-value2');
    await httpRequest(sdk, { url, method: 'get' });
    expect(sdk.options.httpRequestClient).toHaveBeenCalledWith('get', 'fake-url', {
      data: undefined,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'my-header': 'my-value2',
        'other-header': 'other-value2'
      },
      withCredentials: false
    });
  });

});