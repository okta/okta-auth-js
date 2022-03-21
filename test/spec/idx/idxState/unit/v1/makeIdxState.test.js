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


import { makeIdxState } from '../../../../../../lib/idx/idxState/v1/makeIdxState';
const mockIdxResponse = require('../../mocks/request-identifier');
const mockIdxResponseWithIdps = require('../../mocks/request-identifier-with-idps');

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


describe('makeIdxState', () => {
  beforeEach(() => {
    jest.spyOn(mocked.http, 'httpRequest').mockResolvedValue(mockIdxResponse);
  });

  it('returns an idxState', () => {
    const idxState = makeIdxState({}, mockIdxResponse);
    expect(idxState).toBeDefined();
    expect(idxState.context).toBeDefined();
    expect(typeof idxState.proceed).toBe('function');
    expect(typeof idxState.actions.cancel).toBe('function');
    expect(idxState.rawIdxState).toEqual(mockIdxResponse);
  });

  it('populates neededToProceed with Ion data', () => {
    const idxState = makeIdxState({}, mockIdxResponse);
    expect(typeof idxState.neededToProceed[0].action).toBe('function');
    expect(idxState.neededToProceed[0].value).toEqual([
      { label: 'Username', name: 'identifier' },
      {
        name: 'stateHandle',
        required: true,
        value: '02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw',
        visible: false,
        mutable: false,
      },
    ]);
    expect(idxState.neededToProceed[0].method).toBe('POST');
    expect(idxState.neededToProceed[0].name).toBe('identify');
  });

  it('populates neededToProceed with redirect remediation objects and Ion data', () => {
    jest.spyOn(mocked.http, 'httpRequest').mockResolvedValue(mockIdxResponseWithIdps);
    const idxState = makeIdxState({}, mockIdxResponseWithIdps);
    expect(idxState.neededToProceed.length).toBe(4);

    expect(typeof idxState.neededToProceed[0].action).toBe('function');
    expect(idxState.neededToProceed[0].value).toEqual([
      { label: 'Username', name: 'identifier' },
      {
        name: 'stateHandle',
        required: true,
        value: '02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw',
        visible: false,
        mutable: false,
      },
    ]);
    expect(idxState.neededToProceed[0].method).toBe('POST');
    expect(idxState.neededToProceed[0].name).toBe('identify');

    expect(idxState.neededToProceed[1]).toMatchInlineSnapshot(
      `
      Object {
        "action": [Function],
        "href": "https://dev-550580.okta.com/sso/idps/0oa2sykfl6Fnb9ZMN0g4?stateToken=02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw",
        "idp": Object {
          "id": "0oa2sykfl6Fnb9ZMN0g4",
          "name": "Google IDP",
        },
        "method": "GET",
        "name": "redirect-idp",
        "type": "GOOGLE",
      }
    `
    );

    expect(idxState.neededToProceed[2]).toMatchInlineSnapshot(
      `
      Object {
        "action": [Function],
        "href": "https://dev-550580.okta.com/sso/idps/0oa2szc1K1YPgz1pe0g4?stateToken=02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw",
        "idp": Object {
          "id": "0oa2szc1K1YPgz1pe0g4",
          "name": "Facebook IDP",
        },
        "method": "GET",
        "name": "redirect-idp",
        "type": "FACEBOOK",
      }
    `
    );

    expect(typeof idxState.neededToProceed[3].action).toBe('function');
    expect(idxState.neededToProceed[3].value).toEqual([
      {
        name: 'stateHandle',
        required: true,
        value: '02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw',
        visible: false,
        mutable: false,
      },
    ]);
    expect(idxState.neededToProceed[3].method).toBe('POST');
    expect(idxState.neededToProceed[3].name).toBe('select-enroll-profile');
  });

  it('populates proceed to run remediation functions', () => {
    const idxState = makeIdxState({}, mockIdxResponse);
    expect(typeof idxState.proceed).toBe('function');
  });

  describe('idxState.proceed', () => {
    it('rejects if called with an invalid remediationChoice', async () => {
      const idxState = makeIdxState({}, mockIdxResponse);
      return idxState
        .proceed('DOES_NOT_EXIST')
        .then(() => {
          fail('expected idxState.proceed to reject');
        })
        .catch((err) => {
          expect(err).toBe('Unknown remediation choice: [DOES_NOT_EXIST]');
        });
    });

    it('returns a new idxState', async () => {
      const idxState = makeIdxState({}, mockIdxResponse);
      const mockFollowup = { ...mockIdxResponse, remediations: [] };
      jest.spyOn(mocked.http, 'httpRequest').mockResolvedValue(mockFollowup);
      return idxState
        .proceed('identify')
        .then((result) => {
          expect(result.neededToProceed[0].value).toEqual([
            {
              label: 'Username',
              name: 'identifier',
            },
            {
              name: 'stateHandle',
              required: true,
              value: '02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw',
              visible: false,
              mutable: false,
            },
          ]);
          expect(result.context).toBeDefined();
          expect(typeof result.proceed).toBe('function');
          expect(typeof result.actions.cancel).toBe('function');
        });
    });
  });

  describe('idxState.actions', () => {
    it('return a new idxState', async () => {
      const idxState = makeIdxState({}, mockIdxResponse);
      return idxState.actions.cancel().then((result) => {
        // Note: cancel won't return this data
        // this is verifying the parsing happens on mock data
        expect(result.rawIdxState.cancel).toBeDefined();
        expect(result.rawIdxState.cancel.name).toEqual('cancel');
        expect(result.rawIdxState.cancel.href).toEqual(
          'https://dev-550580.okta.com/idp/idx/cancel'
        );
        expect(result.rawIdxState.cancel.value).toEqual([
          {
            name: 'stateHandle',
            required: true,
            value: '02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw',
            visible: false,
            mutable: false,
          },
        ]);
      });
    });
  });
});
