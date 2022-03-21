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


import { divideActionParamsByMutability } from '../../../../../../lib/idx/idxState/v1/actionParser';

const mockIdxResponse = require('../../mocks/request-identifier');

describe('actionParser', () => {
  describe('divideActionParamsByMutability', () => {

    it('parses and splits multiple remediations', async () => {
      const { defaultParams, neededParams, immutableParams } = divideActionParamsByMutability( mockIdxResponse.remediation.value );

      expect( defaultParams ).toEqual({
        identify: {},
        'select-enroll-profile': {},
      });

      expect( neededParams ).toEqual([[{'label': 'Username', 'name': 'identifier'}], []]);

      expect( immutableParams ).toEqual({
        identify: {stateHandle: '02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw'},
        'select-enroll-profile': {stateHandle: '02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw'},
      });
    });

    it('parses and splits a non-remediation', async () => {
      const { defaultParams, neededParams, immutableParams } = divideActionParamsByMutability( mockIdxResponse.cancel);

      expect( defaultParams.cancel ).toEqual({});
      expect( neededParams ).toEqual([[]]);
      expect( immutableParams.cancel ).toEqual({
        stateHandle: '02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw',
      });
    });
  });
});
