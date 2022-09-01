/*!
 * Copyright (c) 2021-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { proceed } from './proceed';

import { 
  IdxPollOptions,
  IdxTransaction,
  OktaAuthIdxInterface,
} from './types';
import { getSavedTransactionMeta } from './transactionMeta';
import { warn } from '../util';

export async function poll(authClient: OktaAuthIdxInterface, options: IdxPollOptions = {}): Promise<IdxTransaction> {
  let transaction = await proceed(authClient, {
    startPolling: true
  });

  const meta = getSavedTransactionMeta(authClient);
  let availablePollingRemeditaions = meta?.remediations?.find(remediation => remediation.includes('poll'));
  if (!availablePollingRemeditaions?.length) {
    warn('No polling remediations available at the current IDX flow stage');
  }

  if (Number.isInteger(options.refresh)) {
    return new Promise(function (resolve, reject) {
      setTimeout(async function () {
        try {
          const refresh = transaction.nextStep?.poll?.refresh;
          if (refresh) {
            resolve(poll(authClient, {
              refresh
            }));
          } else {
            resolve(transaction);
          }
        } catch (err) {
          reject(err);
        }
      }, options.refresh);
    });
  }

  return transaction;
}
