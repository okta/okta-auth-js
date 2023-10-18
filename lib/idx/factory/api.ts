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
 *
 */

import { isInteractionRequired, isInteractionRequiredError } from '../../oidc';
import { authenticate } from '../authenticate';
import { cancel } from '../cancel';
import {
  handleEmailVerifyCallback,
  isEmailVerifyCallback,
  isEmailVerifyCallbackError,
  parseEmailVerifyCallback
} from '../emailVerify';
import { handleInteractionCodeRedirect } from '../handleInteractionCodeRedirect';
import { interact } from '../interact';
import { introspect } from '../introspect';
import { poll } from '../poll';
import { recoverPassword } from '../recoverPassword';
import { register } from '../register';
import { FlowIdentifier, IdxAPI, OktaAuthIdxInterface } from '../types';
import { unlockAccount } from '../unlockAccount';
import * as allRemediators from '../remediators';
import { getFlowSpecification } from '../flow/FlowSpecification';
import { createBaseIdxAPI } from './baseApi';

// Factory
export function createIdxAPI(sdk: OktaAuthIdxInterface): IdxAPI {
  const baseApi = createBaseIdxAPI(sdk);
  const idx = {
    ...baseApi,

    allRemediators,
    getFlowSpecification,

    interact: interact.bind(null, sdk),
    introspect: introspect.bind(null, sdk),
    
    authenticate: authenticate.bind(null, sdk),
    register: register.bind(null, sdk),
    poll: poll.bind(null, sdk),
    cancel: cancel.bind(null, sdk),
    recoverPassword: recoverPassword.bind(null, sdk),

    // oauth redirect callback
    handleInteractionCodeRedirect: handleInteractionCodeRedirect.bind(null, sdk),

    // interaction required callback
    isInteractionRequired: isInteractionRequired.bind(null, sdk),
    isInteractionRequiredError,

    // email verify callback
    handleEmailVerifyCallback: handleEmailVerifyCallback.bind(null, sdk),
    isEmailVerifyCallback,
    parseEmailVerifyCallback,
    isEmailVerifyCallbackError,

    setFlow: (flow: FlowIdentifier) => {
      sdk.options.flow = flow;
    },
    getFlow: (): FlowIdentifier | undefined => {
      return sdk.options.flow;
    },
    unlockAccount: unlockAccount.bind(null, sdk),
  };
  return idx;
}

