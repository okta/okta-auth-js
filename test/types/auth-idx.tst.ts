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
import { expect } from 'tstyche';

const authClient = new OktaAuth({issuer: 'https://{yourOktaDomain}/oauth2/default'});
expect((await authClient.idx.register())).type.toEqual<IdxTransaction>();
expect((await authClient.idx.recoverPassword())).type.toEqual<IdxTransaction>();
expect((await authClient.idx.unlockAccount())).type.toEqual<IdxTransaction>();
expect((await authClient.idx.startTransaction())).type.toEqual<IdxTransaction>();
expect((await authClient.idx.poll())).type.toEqual<IdxTransaction>();
expect((await authClient.idx.start())).type.toEqual<IdxTransaction>();
expect((await authClient.idx.proceed())).type.toEqual<IdxTransaction>();
expect((await authClient.idx.cancel())).type.toEqual<IdxTransaction>();
expect((await authClient.idx.authenticate())).type.toEqual<IdxTransaction>();

const transaction = await authClient.idx.start();
expect(transaction.context.uiDisplay).type.toEqual<IdxContextUIDisplay | undefined>();
expect(transaction.context.currentAuthenticator.value.deviceKnown).type.toEqual<boolean | undefined>();

expect((await authClient.idx.interact())).type.toEqual<InteractResponse>();
expect((await authClient.idx.introspect())).type.toEqual<IdxResponse>();
expect((await authClient.idx.proceed())).type.toEqual<IdxTransaction>();

expect((authClient.idx.canProceed())).type.toEqual<boolean>();
expect((authClient.idx.setFlow('register'))).type.toEqual<void>();
expect((authClient.idx.isInteractionRequired())).type.toEqual<boolean>();
expect((authClient.idx.isInteractionRequiredError(new Error))).type.toEqual<boolean>();
expect((await authClient.idx.handleInteractionCodeRedirect('http://foo'))).type.toEqual<void>();
expect((authClient.idx.isEmailVerifyCallback('https://foo'))).type.toEqual<boolean>();
expect(authClient.idx.getSavedTransactionMeta()).type.toEqual<IdxTransactionMeta | undefined>();
expect((await authClient.idx.createTransactionMeta())).type.toEqual<IdxTransactionMeta>();
expect((await authClient.idx.getTransactionMeta())).type.toEqual<IdxTransactionMeta>();
expect((authClient.idx.saveTransactionMeta({}))).type.toEqual<void>();
expect((authClient.idx.clearTransactionMeta())).type.toEqual<void>();
expect(authClient.idx.clearTransactionMeta()).type.toEqual<void>();
expect((authClient.idx.isTransactionMetaValid({}))).type.toEqual<boolean>();
