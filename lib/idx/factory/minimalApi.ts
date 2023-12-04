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

import { makeIdxState } from '../idxState';
import { canProceed, proceed } from '../proceed';
import { startTransaction } from '../startTransaction';
import {
  clearTransactionMeta,
  createTransactionMeta,
  getSavedTransactionMeta,
  getTransactionMeta,
  isTransactionMetaValid,
  saveTransactionMeta
} from '../transactionMeta';
import { MinimalIdxAPI, MinimalOktaAuthIdxInterface, OktaAuthIdxInterface } from '../types';

// Factory
export function createMinimalIdxAPI(minimalSdk: MinimalOktaAuthIdxInterface): MinimalIdxAPI {
  const sdk = minimalSdk as OktaAuthIdxInterface;
  const boundStartTransaction = startTransaction.bind(null, sdk);
  const idx = {
    makeIdxResponse: makeIdxState.bind(null, sdk),

    start: boundStartTransaction,
    startTransaction: boundStartTransaction, // Use `start` instead. `startTransaction` will be removed in 7.0
    proceed: proceed.bind(null, sdk),
    canProceed: canProceed.bind(null, sdk),
    
    getSavedTransactionMeta: getSavedTransactionMeta.bind(null, sdk),
    createTransactionMeta: createTransactionMeta.bind(null, sdk),
    getTransactionMeta: getTransactionMeta.bind(null, sdk),
    saveTransactionMeta: saveTransactionMeta.bind(null, sdk),
    clearTransactionMeta: clearTransactionMeta.bind(null, sdk),
    isTransactionMetaValid,
  };
  return idx;
}

