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
import { 
  IdxResponse,
  IdxTransaction,
  IdxTransactionMeta,
  IdxContextUIDisplay,
  InteractResponse,
  OktaAuth,
} from '@okta/okta-auth-js';
import { expectType } from 'tsd';

const authClient = new OktaAuth({});
expectType<IdxTransaction>(await authClient.idx.register());
expectType<IdxTransaction>(await authClient.idx.recoverPassword());
expectType<IdxTransaction>(await authClient.idx.unlockAccount());
expectType<IdxTransaction>(await authClient.idx.startTransaction());
expectType<IdxTransaction>(await authClient.idx.poll());
expectType<IdxTransaction>(await authClient.idx.start());
expectType<IdxTransaction>(await authClient.idx.proceed());
expectType<IdxTransaction>(await authClient.idx.cancel());
expectType<IdxTransaction>(await authClient.idx.authenticate());

const transaction = await authClient.idx.start();
expectType<IdxContextUIDisplay | undefined>(transaction.context.uiDisplay);
expectType<boolean | undefined>(transaction.context.currentAuthenticator.value.deviceKnown);

expectType<InteractResponse>(await authClient.idx.interact());
expectType<IdxResponse>(await authClient.idx.introspect());
expectType<IdxTransaction>(await authClient.idx.proceed());

expectType<boolean>(authClient.idx.canProceed());
expectType<void>(authClient.idx.setFlow('register'));
expectType<boolean>(authClient.idx.isInteractionRequired());
expectType<boolean>(authClient.idx.isInteractionRequiredError(new Error));
expectType<void>(await authClient.idx.handleInteractionCodeRedirect('http://foo'));
expectType<boolean>(authClient.idx.isEmailVerifyCallback('https://foo'));
expectType<IdxTransactionMeta|undefined>(authClient.idx.getSavedTransactionMeta());
expectType<IdxTransactionMeta>(await authClient.idx.createTransactionMeta());
expectType<IdxTransactionMeta>(await authClient.idx.getTransactionMeta());
expectType<void>(authClient.idx.saveTransactionMeta({}));
expectType<void>(authClient.idx.clearTransactionMeta());
expectType<boolean>(authClient.idx.isTransactionMetaValid({}));
