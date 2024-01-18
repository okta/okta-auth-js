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
  OktaAuth,
  createAuthnTransactionAPI,
  AuthnTransactionAPI,
  OktaAuthTxInterface,
  AuthnTransaction,
  OktaAuthCoreInterface,
  OktaAuthHttpInterface,
  FingerprintAPI
} from '@okta/okta-auth-js/authn';

import { expectType, expectAssignable, expectError } from 'tsd';

const authClient = new OktaAuth({issuer: 'https://{yourOktaDomain}/oauth2/default'});
expectAssignable<OktaAuthTxInterface>(authClient);
expectAssignable<OktaAuthHttpInterface>(authClient);
expectAssignable<OktaAuthCoreInterface>(authClient);

expectType<AuthnTransactionAPI>(authClient.tx);
expectType<AuthnTransactionAPI>(authClient.authn);
expectType<FingerprintAPI>(authClient.fingerprint);

// does not include OAuth
expectError<undefined>(authClient.token);

// does not include Core
expectError<undefined>(authClient.authStateManager);

// test async methods
(async () => {
  expectType<string>(await authClient.fingerprint());
  expectType<AuthnTransaction>(await authClient.signIn({}));
  expectError(authClient.signInWithCredentials({})); // must provide credentials
  expectType<AuthnTransaction>(await authClient.signInWithCredentials({ username: 'foo', password: 'blah' }));
  expectType<AuthnTransaction>(await authClient.forgotPassword({}));
  expectType<AuthnTransaction>(await authClient.unlockAccount({ username: 'foo', factorType: 'SMS' }));
  expectType<AuthnTransaction>(await authClient.verifyRecoveryToken({ recoveryToken: 'foo' }));
})();

// test factory
const authn = createAuthnTransactionAPI(authClient);
expectType<AuthnTransactionAPI>(authn);

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
