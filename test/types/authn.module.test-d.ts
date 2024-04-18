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
  FingerprintAPI,
  TokenAPI,
  AuthStateManagerInterface
} from '@okta/okta-auth-js/authn';
import { expect } from 'tstyche';

const authClient = new OktaAuth({issuer: 'https://{yourOktaDomain}/oauth2/default'});
expect<OktaAuthTxInterface>().type.toBeAssignable(authClient);
expect<OktaAuthHttpInterface>().type.toBeAssignable(authClient);
expect<OktaAuthCoreInterface>().type.toBeAssignable(authClient);

expect(authClient.tx).type.toEqual<AuthnTransactionAPI>();
expect(authClient.authn).type.toEqual<AuthnTransactionAPI>();
expect(authClient.fingerprint).type.toEqual<FingerprintAPI>();

expect(authClient.token).type.toEqual<TokenAPI>();
expect(authClient.authStateManager).type.toEqual<AuthStateManagerInterface>();

// test async methods
expect(await authClient.fingerprint()).type.toEqual<string>();
expect(await authClient.signIn({})).type.toEqual<AuthnTransaction>();
expect(authClient.signInWithCredentials({})).type.toRaiseError(); // must provide credentials
expect(await authClient.signInWithCredentials({ username: 'foo', password: 'blah' })).type.toEqual<AuthnTransaction>();
expect(await authClient.forgotPassword({})).type.toEqual<AuthnTransaction>();
expect(await authClient.unlockAccount({ username: 'foo', factorType: 'SMS' })).type.toEqual<AuthnTransaction>();
expect(await authClient.verifyRecoveryToken({ recoveryToken: 'foo' })).type.toEqual<AuthnTransaction>();


// test factory
const authn = createAuthnTransactionAPI(authClient);
expect(authn).type.toEqual<AuthnTransactionAPI>();

// test sync methods
expect(authn.exists()).type.toEqual<boolean>();
expect(authn.createTransaction()).type.toEqual<AuthnTransaction>();

// test async methods
expect(await authn.status()).type.toEqual<object>();
expect(await authn.resume()).type.toEqual<AuthnTransaction>();
expect(await authn.introspect()).type.toEqual<AuthnTransaction>();
expect(await authn.postToTransaction('/url')).type.toEqual<AuthnTransaction>();
