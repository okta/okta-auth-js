/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
  OktaAuth
} from '@okta/okta-auth-js/core';

import {
  createAuthnTransactionAPI,
  useAuthnTransactionAPI,
  AuthnTransactionAPI,
  OktaAuthTxInterface,
  AuthnTransaction
} from '@okta/okta-auth-js/authn';

import { expectType, expectAssignable, expectNotAssignable } from 'tsd';

const authClient = new OktaAuth({});
expectNotAssignable<OktaAuthTxInterface>(authClient);

// test factory
const authn = createAuthnTransactionAPI(authClient);
expectType<AuthnTransactionAPI>(authn);

// test mixin
const authClientTx = useAuthnTransactionAPI(authClient);
expectAssignable<OktaAuthTxInterface>(authClientTx);
expectType<AuthnTransactionAPI>(authClientTx.tx);
expectType<AuthnTransactionAPI>(authClientTx.authn);

// test sync methods
expectType<boolean>(authn.exists());
expectType<AuthnTransaction>(authn.createTransaction());

// test async methods
(async () => {
  expectType<object>(await authn.status());
  expectType<AuthnTransaction>(await authn.resume());
  expectType<AuthnTransaction>(await authn.introspect());
  expectType<AuthnTransaction>(await authn.postToTransaction('/url'));
})();
