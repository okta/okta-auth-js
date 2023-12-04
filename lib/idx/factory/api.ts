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
import { makeIdxState } from '../idxState';
import { interact } from '../interact';
import { introspect } from '../introspect';
import { poll } from '../poll';
import { canProceed, proceed } from '../proceed';
import { recoverPassword } from '../recoverPassword';
import { register } from '../register';
import { startTransaction } from '../startTransaction';
import {
  clearTransactionMeta,
  createTransactionMeta,
  getSavedTransactionMeta,
  getTransactionMeta,
  isTransactionMetaValid,
  saveTransactionMeta
} from '../transactionMeta';
import { FlowIdentifier, IdxAPI, OktaAuthIdxInterface } from '../types';
import { unlockAccount } from '../unlockAccount';
import * as remediators from '../remediators';
import { getFlowSpecification } from '../flow/FlowSpecification';
import { setRemediatorsCtx } from '../util';

// Factory
export function createIdxAPI(sdk: OktaAuthIdxInterface): IdxAPI {
  setRemediatorsCtx({
    remediators,
    getFlowSpecification,
  });
  const boundStartTransaction = startTransaction.bind(null, sdk);
  const idx = {
    interact: interact.bind(null, sdk),
    introspect: introspect.bind(null, sdk),
    makeIdxResponse: makeIdxState.bind(null, sdk),
    
    authenticate: authenticate.bind(null, sdk),
    register: register.bind(null, sdk),
    start: boundStartTransaction,
    startTransaction: boundStartTransaction, // Use `start` instead. `startTransaction` will be removed in 7.0
    poll: poll.bind(null, sdk),
    proceed: proceed.bind(null, sdk),
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
    
    getSavedTransactionMeta: getSavedTransactionMeta.bind(null, sdk),
    createTransactionMeta: createTransactionMeta.bind(null, sdk),
    getTransactionMeta: getTransactionMeta.bind(null, sdk),
    saveTransactionMeta: saveTransactionMeta.bind(null, sdk),
    clearTransactionMeta: clearTransactionMeta.bind(null, sdk),
    isTransactionMetaValid,
    setFlow: (flow: FlowIdentifier) => {
      sdk.options.flow = flow;
    },
    getFlow: (): FlowIdentifier | undefined => {
      return sdk.options.flow;
    },
    canProceed: canProceed.bind(null, sdk),
    unlockAccount: unlockAccount.bind(null, sdk),
  };
  return idx;
}

