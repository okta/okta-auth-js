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


import introspect from '../../../../../../lib/idx/idx-js/introspect';

jest.mock('cross-fetch');
import fetch from 'cross-fetch'; // import to target for mockery

const mockIdxResponse = require('../../mocks/legacy/request-identifier');
const mockErrorResponse = require('../../mocks/legacy/error-response');
const { Response } = jest.requireActual('cross-fetch');

let domain = 'http://okta.example.com';
let stateHandle = 'FAKEY-FAKE';
let version = '1.0.0';

describe('introspect', () => {
  it('returns an idxResponse on success', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockIdxResponse )) ) );
    return introspect({ domain, stateHandle, version })
      .then( result => {
        expect(result).toEqual(mockIdxResponse);
      });
  });

  it('rejects if the idxResponse is an error', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockErrorResponse ), { status: 500 }) ) );
    return introspect({ domain, stateHandle, version })
      .then( () => {
        fail('expected introspect to reject when fetch call returns an HTTP error code');
      })
      .catch( err => {
        expect(err).toEqual({
          errorCode: 'E0000068',
          errorSummary: 'Invalid Token',
          errorLink: 'E0000068',
          errorId: 'oaeEtqUk5zeRVSlSM-jiw7GFA',
          errorCauses: [ { errorSummary: 'Authentication failed' } ]
        });
      });
  });

  it.only('sends the version along', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockIdxResponse )) ));
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


});
