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


import { generateRemediationFunctions } from '../../../../../../lib/idx/idxState/v1/remediationParser';

// imports to target for mockery
import generateIdxAction from '../../../../../../lib/idx/idxState/v1/generateIdxAction';

jest.mock('../../../../../../lib/http', () => {
  const actual = jest.requireActual('../../../../../../lib/http');
  return {
    ...actual,
    httpRequest: () => {}
  };
});
/*
  Doing a jest.mock('../../src/generateIdxAction') has problems with jest.mock causing the test to hang
  and spikes up the CPU usage for the current node process.
  Alternative mocking approach: https://jestjs.io/docs/en/es6-class-mocks
*/
const mockGenerateIdxAction = jest.fn();
jest.mock('../../../../../../lib/idx/idxState/v1/generateIdxAction', () => {
  return jest.fn().mockImplementation(() => {
    return {generateIdxAction: mockGenerateIdxAction};
  });
});

const mockRequestIdentity = require('../../mocks/request-identifier');
const mockIdxResponse = mockRequestIdentity;

const mocked = {
  http: require('../../../../../../lib/http')
};

generateIdxAction.mockImplementation( () => 'generated');

describe('remediationParser', () => {

  beforeEach(() => {
    jest.spyOn(mocked.http, 'httpRequest').mockResolvedValue(mockRequestIdentity);
  });

  describe('generateRemediationFunctions', () => {

    it('builds a collection of generated functions', async () => {
      const toPersist = {};
      const remediationFunctions = generateRemediationFunctions({}, mockIdxResponse.remediation.value);
      expect( Object.keys(remediationFunctions) ).toEqual( ['identify', 'select-enroll-profile'] );
      expect(generateIdxAction.mock.calls[0]).toEqual([{}, mockIdxResponse.remediation.value[0], toPersist]);
      expect(generateIdxAction.mock.calls[1]).toEqual([{}, mockIdxResponse.remediation.value[1], toPersist]);
      expect(remediationFunctions['identify']).toBe('generated');
      expect(remediationFunctions['select-enroll-profile']).toBe('generated');
    });

  });

});

