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


import introspect from '../../../../../lib/idx/idx-js/introspect';
import { HttpClient } from '../../../../../lib/idx/idx-js/client';
jest.mock('cross-fetch');
import fetch from 'cross-fetch'; // import to target for mockery

const mockIdxResponse = require('../mocks/request-identifier');
const mockErrorResponse = require('../mocks/error-authenticator-enroll');
const { Response } = jest.requireActual('cross-fetch');

let domain = 'http://okta.example.com';
let stateHandle = 'FAKEY-FAKE';
let version = '1.0.0';

describe('introspect', () => {
  afterEach(() => {
    HttpClient.interceptors.request.clear();
  });

  it('returns an idxResponse on success', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockIdxResponse )) ) );
    return introspect({ domain, stateHandle, version })
      .then( result => {
        expect(result).toEqual({
          ...mockIdxResponse,
          requestDidSucceed: true
        });
      });
  });

  it('by default, sends credentials on the request', () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockIdxResponse )) ) );
    return introspect({ domain, stateHandle, version })
      .then( () => {
        expect( fetch.mock.calls.length ).toBe(1);
        expect( fetch.mock.calls[0][0] ).toEqual( 'http://okta.example.com/idp/idx/introspect' );
        expect( fetch.mock.calls[0][1] ).toEqual( {
          body: '{"stateToken":"FAKEY-FAKE"}',
          credentials: 'include', // what we are testing
          headers: {
            'content-type': 'application/ion+json; okta-version=1.0.0',
            'accept': 'application/ion+json; okta-version=1.0.0',
          },
          method: 'POST'
        });
      });
  });

  it('can omit credentials by setting withCredentials to false', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockIdxResponse )) ) );
    return introspect({ domain, stateHandle, version, withCredentials: false })
      .then( () => {
        expect( fetch.mock.calls.length ).toBe(1);
        expect( fetch.mock.calls[0][0] ).toEqual( 'http://okta.example.com/idp/idx/introspect' );
        expect( fetch.mock.calls[0][1] ).toEqual( {
          body: '{"stateToken":"FAKEY-FAKE"}',
          credentials: 'omit', // what we are testing
          headers: {
            'content-type': 'application/ion+json; okta-version=1.0.0',
            'accept': 'application/ion+json; okta-version=1.0.0',
          },
          method: 'POST'
        });
      });
  });

  it('sets `requestDidSucceed` to `false` if the XHR request returned an HTTP error status', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockErrorResponse ), { status: 500 }) ) );
    return introspect({ domain, stateHandle, version })
      .then( err => {
        expect(err).toEqual({
          ...mockErrorResponse,
          requestDidSucceed: false
        });
      });
  });

  it('sends the SDK version as a custom header', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockIdxResponse )) ) );
    return introspect({ domain, stateHandle, version })
      .then( () => {
        expect( fetch.mock.calls.length ).toBe(1);
        expect( fetch.mock.calls[0][0] ).toEqual( 'http://okta.example.com/idp/idx/introspect' );
        expect( fetch.mock.calls[0][1] ).toEqual( {
          body: '{"stateToken":"FAKEY-FAKE"}',
          credentials: 'include',
          headers: {
            'content-type': 'application/ion+json; okta-version=1.0.0',
            'accept': 'application/ion+json; okta-version=1.0.0',
          },
          method: 'POST'
        });
      });
  });

  it('allows consumers of the library to pass in custom headers', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockIdxResponse )) ) );

    HttpClient.interceptors.request.use( (config) => {
      // Rewrite headers
      config.headers['X-Test-Header'] = 'foo';
      config.headers['X-Okta-User-Agent-Extended'] = 'my-sdk-value';
    });

    return introspect({ domain, stateHandle, version })
      .then( () => {
        expect( fetch.mock.calls.length ).toBe(1);
        expect( fetch.mock.calls[0][0] ).toEqual( 'http://okta.example.com/idp/idx/introspect' );
        expect( fetch.mock.calls[0][1] ).toEqual( {
          body: '{"stateToken":"FAKEY-FAKE"}',
          credentials: 'include',
          headers: {
            'content-type': 'application/ion+json; okta-version=1.0.0',
            'accept': 'application/ion+json; okta-version=1.0.0',
            'X-Test-Header': 'foo',
            'X-Okta-User-Agent-Extended': 'my-sdk-value',
          },
          method: 'POST'
        });
      });
  });

});
