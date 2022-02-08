/*!
 * Copyright (c) 2021-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */


import { HttpClient, request } from '../../../../../lib/idx/idx-js/client';

jest.mock('cross-fetch');
import fetch from 'cross-fetch'; // import to target for mockery

const mockInteractResponse = require('../mocks/interact-response');
const { Response } = jest.requireActual('cross-fetch');

describe('request', () => {
  describe('credentials', () => {
    it('is set to "include" by default', async () => {
      fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockInteractResponse )) ) );
      await request('https://example.com', { body: 'foo=bar' });
      expect( fetch.mock.calls.length ).toBe(1);
      expect( fetch.mock.calls[0][0] ).toEqual( 'https://example.com' );
      expect( fetch.mock.calls[0][1] ).toEqual( {
        body: 'foo=bar',
        credentials: 'include',
        headers: {},
        method: 'POST',
      });
    });
    it('can be set by caller', async () => {
      fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockInteractResponse )) ) );
      await request('https://example.com', { body: 'foo=bar', credentials: 'omit' });
      expect( fetch.mock.calls.length ).toBe(1);
      expect( fetch.mock.calls[0][0] ).toEqual( 'https://example.com' );
      expect( fetch.mock.calls[0][1] ).toEqual( {
        body: 'foo=bar',
        credentials: 'omit',
        headers: {},
        method: 'POST',
      });
    });
  });

  it('does not process interceptors when none are configured', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockInteractResponse )) ) );

    return request('https://example.com', { body: 'foo=bar' })
      .then( () => {
        expect( fetch.mock.calls.length ).toBe(1);
        expect( fetch.mock.calls[0][0] ).toEqual( 'https://example.com' );
        expect( fetch.mock.calls[0][1] ).toEqual( {
          body: 'foo=bar',
          credentials: 'include',
          headers: {},
          method: 'POST',
        });
      });
  });

  it('allows consumers of the library change configuration values through interceptors', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockInteractResponse )) ) );

    const interceptor = (config) => {
      // Rewrite config by reference
      config.url = 'https://okta.com';
      config.headers = { 'foo': 'bar' };
      config.method = 'GET';
      config.body = 'body value';
    };

    HttpClient.interceptors.request.use(interceptor);

    return request('https://example.com', { /* use lib defaults */ })
      .then( () => {
        expect( fetch.mock.calls.length ).toBe(1);
        expect( fetch.mock.calls[0][0] ).toEqual( 'https://okta.com' );
        expect( fetch.mock.calls[0][1] ).toEqual( {
          body: 'body value',
          credentials: 'include',
          headers: {
            'foo': 'bar',
          },
          method: 'GET'
        });
      });
  });

  it('allows consumers of the library add and remove interceptors', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockInteractResponse )) ) );

    const interceptor = (config) => {
      // Rewrite config by reference
      config.url = 'changed';
    };

    HttpClient.interceptors.request.use(interceptor);

    await request('https://example.com', { /* use lib defaults */ })
      .then( () => {
        expect( fetch.mock.calls.length ).toBe(1);
        expect( fetch.mock.calls[0][0] ).toEqual( 'changed' );
      });

    // Clear all attached interceptors
    HttpClient.interceptors.request.clear();

    await request('https://example.com', { /* use lib defaults */ })
      .then( () => {
        expect( fetch.mock.calls.length ).toBe(2);
        expect( fetch.mock.calls[1][0] ).toEqual( 'https://example.com' );
      });
  });
});
