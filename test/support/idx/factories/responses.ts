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
import { IdxContext, IdxResponse, RawIdxResponse } from '../../../../lib/idx/types/idx-js';
import {
  IdentifyRemediationFactory,
  IdentifyWithPasswordRemediationFactory,
  VerifyPasswordRemediationFactory,
  VerifyEmailRemediationFactory
} from './remediations';
import { 
  IdxAuthenticatorFactory,
} from './authenticators';

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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    proceed: () => Promise.resolve(transientParams.nextResponse!),
    neededToProceed: [],
    rawIdxState: RawIdxResponseFactory.build({
      version: transientParams.idxVersion,
      stateHandle: transientParams.stateHandle,
    }),
    actions: {},
    toPersist: {},
    context: {} as IdxContext,
    requestDidSucceed: true
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

export const VerifyEmailResponseFactory = IdxResponseFactory.params({
  neededToProceed: [
    VerifyEmailRemediationFactory.build()
  ]
});

export const IdxContextFactory = Factory.define<IdxContext>(() => {
  return {
    version: '',
    stateHandle: '',
    intent: '',
    user: {
      type: '',
      value: {}
    },
    app: {
      type: '',
      value: {}
    },
    expiresAt: '',
    currentAuthenticator: {
      type: 'object',
      value: IdxAuthenticatorFactory.build(),
    },
    authenticators: {
      type: 'array',
      value: []
    },
    enrollmentAuthenticator: {
      type: 'object',
      value: IdxAuthenticatorFactory.build(),
    },
    authenticatorEnrollments: {
      type: 'array',
      value: []
    }
  };
});
