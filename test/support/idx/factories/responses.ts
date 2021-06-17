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
 */


/* eslint-disable max-len */
import { Factory } from 'fishery';
import { IdxResponse, RawIdxResponse } from '../../../../lib/idx/types/idx-js';
import {
  IdentifyRemediationFactory,
  IdentifyWithPasswordRemediationFactory,
  VerifyPasswordRemediationFactory,
} from './remediations';

export const RawIdxResponseFactory = Factory.define<RawIdxResponse>(() => {
  return {
    version: '1.0.0',
    stateHandle: 'unknown-stateHandle'
  };
});

interface MockedIdxResponseTransientParams {
  nextResponse?: IdxResponse;
  idxVersion?: string;
  stateHandle?: string;
}

export const IdxResponseFactory = Factory.define<IdxResponse, MockedIdxResponseTransientParams>(({
  transientParams
}) => {
  return {
    proceed: () => Promise.resolve(transientParams.nextResponse),
    neededToProceed: [],
    rawIdxState: RawIdxResponseFactory.build({
      version: transientParams.idxVersion,
      stateHandle: transientParams.stateHandle,
    }),
    actions: {},
    toPersist: {},
    context: {}
  };
});

export const IdentifyResponseFactory = IdxResponseFactory.params({
  neededToProceed: [
    IdentifyRemediationFactory.build()
  ]
});

export const IdentifyWithPasswordResponseFactory = IdentifyResponseFactory.params({
  neededToProceed: [
    IdentifyWithPasswordRemediationFactory.build()
  ]
});

export const VerifyPasswordResponseFactory = IdxResponseFactory.params({
  neededToProceed: [
    VerifyPasswordRemediationFactory.build()
  ]
});
