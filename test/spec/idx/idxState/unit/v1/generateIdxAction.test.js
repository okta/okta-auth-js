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


import generateIdxAction from '../../../../../../lib/idx/idxState/v1/generateIdxAction';

const mockIdxResponse = require('../../mocks/request-identifier');
const mockPollingIdxResponse = require('../../mocks/poll-for-password');

jest.mock('../../../../../../lib/http', () => {
  const actual = jest.requireActual('../../../../../../lib/http');
  return {
    ...actual,
    httpRequest: () => {}
  };
});

const mocked = {
  http: require('../../../../../../lib/http'),
};

const deepClone = ( target ) => JSON.parse(JSON.stringify( target ));
const mockResponse = ( respondWith ) => Promise.resolve(respondWith);

import { AuthApiError } from '../../../../../../lib/errors';

describe('generateIdxAction', () => {
  let testContext;
  beforeEach(() => {
    const sdk = {
      idx: {
        makeIdxResponse: jest.fn()
      }
    };
    testContext = { sdk };
  });

  it('builds a function', () => {
    const actionFunction = generateIdxAction( {}, mockIdxResponse.remediation.value[0]);
    expect(typeof actionFunction).toBe('function');
  });

  it('returns a function that returns an idxState', async () => {
    const { sdk } = testContext;
    const http = jest.spyOn(mocked.http, 'httpRequest');
    http.mockImplementationOnce( () => mockResponse( mockIdxResponse ));
    sdk.idx.makeIdxResponse.mockReturnValue('mock IdxState');
    const actionFunction = generateIdxAction(sdk, mockIdxResponse.remediation.value[0]);
    return actionFunction()
      .then( result => {
        expect( http.mock.calls.length ).toBe(1);
        expect( http.mock.calls[0][0] ).toEqual( sdk );   // authClient
        expect( http.mock.calls[0][1] ).toEqual( {
          url: 'https://dev-550580.okta.com/idp/idx/identify',
          args: '{"stateHandle":"02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw"}',
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/ion+json; okta-version=1.0.0',
          },
          method: 'POST'
        });
        expect( result ).toBe('mock IdxState');
      });
  });

  it('if toPersist.withCredentials is false, it will set credentials to "omit"', async () => {
    const { sdk } = testContext;
    const http = jest.spyOn(mocked.http, 'httpRequest');
    http.mockImplementationOnce( () => mockResponse( mockIdxResponse ));
    sdk.idx.makeIdxResponse.mockReturnValue('mock IdxState');
    const actionFunction = generateIdxAction(sdk, mockIdxResponse.remediation.value[0], { withCredentials: false });
    return actionFunction()
      .then( result => {
        expect( http.mock.calls.length ).toBe(1);
        expect( http.mock.calls[0][0] ).toEqual( sdk );   // authClient
        expect( http.mock.calls[0][1] ).toEqual( {
          url: 'https://dev-550580.okta.com/idp/idx/identify',
          args: '{"stateHandle":"02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw"}',
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/ion+json; okta-version=1.0.0',
          },
          method: 'POST'
        });
        expect( result ).toBe('mock IdxState');
      });
  });

  it('handles the status code for Okta device authentication', async () => {
    const { sdk } = testContext;
    const http = jest.spyOn(mocked.http, 'httpRequest');
    http.mockImplementationOnce( () => Promise.reject( 
      new AuthApiError(
        new Error('random error'),
        { responseJSON: {}, status: 401, headers: { 'Content-Type': 'application/json', 'WWW-Authenticate': 'Oktadevicejwt realm="Okta Device"' } }
    )));
    sdk.idx.makeIdxResponse.mockReturnValue({});
    const actionFunction = generateIdxAction(sdk, mockIdxResponse.remediation.value[0]);
    return actionFunction()
      .then( result => {
        fail('mock call should have failed', result);
      })
      .catch( result => {
        expect( http.mock.calls.length ).toBe(1);
        expect( http.mock.calls[0][0] ).toEqual( sdk );
        expect( http.mock.calls[0][1] ).toEqual( {
          url: 'https://dev-550580.okta.com/idp/idx/identify',
          args: '{"stateHandle":"02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw"}',
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/ion+json; okta-version=1.0.0',
          },
          method: 'POST'
        });
        expect( result ).toEqual({stepUp: true});
      });
  });

  it('sends pre-filled default field values', async () => {
    const { sdk } = testContext;
    const http = jest.spyOn(mocked.http, 'httpRequest');
    http.mockImplementationOnce( () => mockResponse( mockIdxResponse ));
    sdk.idx.makeIdxResponse.mockReturnValue('mock IdxState');

    const mockRemediationWithValue = deepClone(mockIdxResponse.remediation.value[0]);
    expect(mockRemediationWithValue.value[0].name).toBe('identifier');
    mockRemediationWithValue.value[0].value = 'A_DEFAULT';

    const actionFunction = generateIdxAction(sdk, mockRemediationWithValue);
    return actionFunction({ })
      .catch( result => {
        fail('mock http failed', result);
      })
      .then( () => {
        expect( http.mock.calls[0][1] ).toEqual( {
          url: 'https://dev-550580.okta.com/idp/idx/identify',
          args: '{"identifier":"A_DEFAULT","stateHandle":"02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw"}',
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/ion+json; okta-version=1.0.0',
          },
          method: 'POST'
        });
      });
  });

  it('does not allow overridding immutable fields', async () => {
    const { sdk } = testContext;
    const http = jest.spyOn(mocked.http, 'httpRequest');
    http.mockImplementationOnce( () => mockResponse( mockIdxResponse ));
    sdk.idx.makeIdxResponse.mockReturnValue('mock IdxState');
    const mockRemediationWithImmutableValue = deepClone(mockIdxResponse.remediation.value[0]);
    expect(mockRemediationWithImmutableValue.value[1].name).toBe('stateHandle');
    expect(mockRemediationWithImmutableValue.value[1].mutable).toBe(false);

    const actionFunction = generateIdxAction(sdk, mockRemediationWithImmutableValue);
    return actionFunction({ stateHandle: 'SHOULD_NOT_CHANGE' })
      .catch( result => {
        fail('mock http failed', result);
      })
      .then( () => {
        expect( http.mock.calls[0][1] ).toEqual( {
          url: 'https://dev-550580.okta.com/idp/idx/identify',
          args: '{"stateHandle":"02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw"}',
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/ion+json; okta-version=1.0.0',
          },
          method: 'POST'
        });
      });
  });

  it('does allow overridding mutable values', async () => {
    const { sdk } = testContext;
    const http = jest.spyOn(mocked.http, 'httpRequest');
    http.mockImplementationOnce( () => mockResponse( mockIdxResponse ));
    sdk.idx.makeIdxResponse.mockReturnValue('mock IdxState');

    const mockRemediationWithMutableValue = JSON.parse(JSON.stringify(mockIdxResponse.remediation.value[0]));
    expect(mockRemediationWithMutableValue.value[0].name).toBe('identifier');
    expect(mockRemediationWithMutableValue.value[0].mutable).not.toBe(false);
    mockRemediationWithMutableValue.value[0].value = 'SHOULD_CHANGE';

    const actionFunction = generateIdxAction(sdk, mockRemediationWithMutableValue);
    return actionFunction({ identifier: 'WAS_CHANGED' })
      .catch( result => {
        fail('mock http failed', result);
      })
      .then( () => {
        expect( http.mock.calls[0][1] ).toEqual( {
          url: 'https://dev-550580.okta.com/idp/idx/identify',
          args: '{"identifier":"WAS_CHANGED","stateHandle":"02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw"}',
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/ion+json; okta-version=1.0.0',
          },
          method: 'POST'
        });
      });
  });


  // TODO: Conditions to decide if polling is finished are being discussed
  // eslint-disable-next-line jasmine/no-disabled-tests
  xit('generates a polling function when appropriate', () => {
    generateIdxAction( {},  mockPollingIdxResponse.factor.value.poll );
    fail('not done yet');
  });
});
