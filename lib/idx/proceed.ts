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


import type { RemediateAction } from './remediate';
import { 
  OktaAuthIdxInterface,
  IdxTransaction,
  ProceedOptions
} from './types';
import { run } from './run';
import { getSavedTransactionMeta } from './transactionMeta';
import { AuthSdkError } from '../errors';


export async function proceed(
  authClient: OktaAuthIdxInterface,
  // step: string,
  options: ProceedOptions = {}
): Promise<IdxTransaction> {
  const { state, stateHandle } = options;
  let { flow } = options;
  const meta = getSavedTransactionMeta(authClient, { state });

  // if there's no stored transaction nor provided `stateHandle`, we cannot proceed
  if (!meta && !stateHandle) {
    throw new AuthSdkError('Unable to proceed: saved transaction could not be loaded');
  }

  flow ??= meta?.flow;

  return run(authClient, { 
    ...options,
    // step,
    flow
  });
}
