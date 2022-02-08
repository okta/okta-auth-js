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


import idx from '../../../../../../lib/idx/idx-js';
//  We must import before webpack to be able to mock
//  Integration tests will run against webpacked code

// Note: All network interactions should be mocked
// All stateHandles and similar are fake
// See the integration tests for the full back-and-forth

jest.mock('cross-fetch');
import fetch from 'cross-fetch'; // import to target for mockery
const mockRequestIdentity = require('../../mocks/legacy/request-identifier');
const { Response } = jest.requireActual('cross-fetch');

fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockRequestIdentity )) ) );

const stateHandle = 'FAKE_STATE_HANDLE';
const domain = 'http://okta.example.com';
const version = '1.0.0';

describe('idx-js', () => {
  describe('start', () => {

    // eslint-disable-next-line jasmine/no-disabled-tests
    xit('rejects without a stateHandle', async () => {
      return idx.start({ domain, version })
        .then( () => {
          fail('expected idx.start to reject when not given a stateHandle');
        })
        .catch( err => {
          expect(err).toStrictEqual({ error: 'stateHandle is required'});
        });
    });

    it('rejects without a domain', async () => {
      return idx.start({ stateHandle, version })
        .then( () => {
          fail('expected idx.start to reject when not given a domain');
        })
        .catch( err => {
          expect(err).toStrictEqual({ error: 'issuer is required'});
        });
    });

    it('rejects without a version', async () => {
      return idx.start({ stateHandle, domain })
        .then( () => {
          fail('expected idx.start to reject when not given a version');
        })
        .catch( err => {
          expect(fetch).not.toHaveBeenCalled();
          expect(err).toEqual(new Error('version is required'));
        });
    });

    it('does not call introspect with a well formed but bad version', async () => {
      return idx.start({ stateHandle, domain, version: '999999.9999.9999' })
        .then( () => {
          fail('expected idx.start to reject when not given a wrong version');
        })
        .catch( err => {
          expect( err ).toEqual(new Error('Unknown api version: 999999.9999.9999.  Use an exact semver version.'));
          expect( fetch ).not.toHaveBeenCalled();
        });
    });

    it('returns an idxState', async () => {
      return idx.start({ domain, stateHandle, version })
        .then( idxState => {
          expect(idxState).toBeDefined();
          expect(idxState.context).toBeDefined();
          expect(typeof idxState.proceed).toBe('function');
          expect(typeof idxState.actions.cancel).toBe('function');
          expect(idxState.rawIdxState).toStrictEqual(mockRequestIdentity);
        });
    });

  });
});
