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


import { run } from './run';
import { hasSavedInteractionHandle } from './transactionMeta';
import { startTransaction } from './startTransaction';
import { AuthSdkError } from '../errors';
import { 
  OktaAuthIdxInterface, 
  AccountUnlockOptions, 
  IdxTransaction,
  IdxFeature,
} from './types';

export async function unlockAccount(
  authClient: OktaAuthIdxInterface, options: AccountUnlockOptions = {}
): Promise<IdxTransaction> {
  options.flow = 'unlockAccount';

  // Only check at the beginning of the transaction
  if (!hasSavedInteractionHandle(authClient)) {
    const { enabledFeatures } = await startTransaction(authClient, { ...options, autoRemediate: false });
    if (enabledFeatures && !enabledFeatures.includes(IdxFeature.ACCOUNT_UNLOCK)) {
      throw new AuthSdkError(
        'Self Service Account Unlock is not supported based on your current org configuration.'
      );
    }
  }

  return run(authClient, { ...options });
}
