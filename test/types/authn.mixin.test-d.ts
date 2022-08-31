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
  AuthnTransactionAPI,
  OktaAuthTxInterface,
  mixinAuthn,
  FingerprintAPI,
  OktaAuthBaseOptions,
  OktaAuthOptionsConstructor,
  createBaseOptionsConstructor,
  createOktaAuthBase,
  OktaAuthHttpOptions,
  createHttpOptionsConstructor,
  mixinHttp,
  mixinStorage,
  BaseStorageManager,
  OktaAuthOAuthOptions,
  OktaAuthOauthOptionsConstructor,
  createOAuthOptionsConstructor,
  OAuthStorageManagerConstructor,
  createOAuthStorageManager,
  TransactionManagerConstructor,
  createTransactionManager,
  createOktaAuthOAuth,
  TokenAPI,
  AuthnTransaction
} from '@okta/okta-auth-js';

import { expectType, expectAssignable, expectNotAssignable, expectError } from 'tsd';


const baseOptions: OktaAuthBaseOptions = { devMode: true };
const BaseOptions: OktaAuthOptionsConstructor<OktaAuthBaseOptions> = createBaseOptionsConstructor();
const OktaAuthBase = createOktaAuthBase(BaseOptions);

// Cannot mixin on a Base interface
expectError(mixinAuthn(OktaAuthBase));

const httpOptions: OktaAuthHttpOptions = { ...baseOptions };
const HttpOptions: OktaAuthOptionsConstructor<OktaAuthHttpOptions> = createHttpOptionsConstructor();
const OktaAuthWithHttp = mixinHttp(mixinStorage(createOktaAuthBase(HttpOptions), BaseStorageManager));

// Can mixin on an HTTP interface
const OktaAuthWithAuthn = mixinAuthn(OktaAuthWithHttp);
const authnClient = new OktaAuthWithAuthn(httpOptions);

// includes authn
expectAssignable<OktaAuthTxInterface>(authnClient);
expectType<AuthnTransactionAPI>(authnClient.tx);
expectType<AuthnTransactionAPI>(authnClient.authn);
expectType<FingerprintAPI>(authnClient.fingerprint);

// does not include OAuth
expectError<undefined>(authnClient.token);

// does not include Core
expectError<undefined>(authnClient.authStateManager);

// test async methods
(async () => {
  expectType<string>(await authnClient.fingerprint());
  expectType<AuthnTransaction>(await authnClient.signIn({}));
  expectError(authnClient.signInWithCredentials({})); // must provide credentials
  expectType<AuthnTransaction>(await authnClient.signInWithCredentials({ username: 'foo', password: 'blah' }));
  expectType<AuthnTransaction>(await authnClient.forgotPassword({}));
  expectType<AuthnTransaction>(await authnClient.unlockAccount({ username: 'foo', factorType: 'SMS' }));
  expectType<AuthnTransaction>(await authnClient.verifyRecoveryToken({ recoveryToken: 'foo' }));
})();

// Create an OAuth base class
const oauthOptions: OktaAuthOAuthOptions = { ...baseOptions };
const OAuthOptions: OktaAuthOauthOptionsConstructor = createOAuthOptionsConstructor();
const OAuthStorageManager: OAuthStorageManagerConstructor = createOAuthStorageManager();
const TransactionManager: TransactionManagerConstructor = createTransactionManager();
const OktaAuthOAuth = createOktaAuthOAuth(OAuthStorageManager, OAuthOptions, TransactionManager);

const OktaAuthOAuthWithAuthn = mixinAuthn(OktaAuthOAuth);
const oauthClient = new OktaAuthOAuthWithAuthn(httpOptions);

// includes OAuth
expectType<TokenAPI>(oauthClient.token);

// includes authn
expectAssignable<OktaAuthTxInterface>(oauthClient);
expectType<AuthnTransactionAPI>(oauthClient.tx);
expectType<AuthnTransactionAPI>(oauthClient.authn);
expectType<FingerprintAPI>(oauthClient.fingerprint);
