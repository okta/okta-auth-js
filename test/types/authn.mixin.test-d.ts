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

import { expect } from 'tstyche';

const baseOptions: OktaAuthBaseOptions = { devMode: true };
const BaseOptions: OktaAuthOptionsConstructor<OktaAuthBaseOptions> = createBaseOptionsConstructor();
const OktaAuthBase = createOktaAuthBase(BaseOptions);

// Cannot mixin on a Base interface
expect(mixinAuthn(OktaAuthBase)).type.toRaiseError();

const httpOptions: OktaAuthHttpOptions = { ...baseOptions, enablePollDelay: true };
const HttpOptions: OktaAuthOptionsConstructor<OktaAuthHttpOptions> = createHttpOptionsConstructor();
const OktaAuthWithHttp = mixinHttp(mixinStorage(createOktaAuthBase(HttpOptions), BaseStorageManager));

// Can mixin on an HTTP interface
const OktaAuthWithAuthn = mixinAuthn(OktaAuthWithHttp);
const authnClient = new OktaAuthWithAuthn(httpOptions);

// includes authn
expect<OktaAuthTxInterface>().type.toBeAssignable(authnClient);
expect(authnClient.tx).type.toEqual<AuthnTransactionAPI>();
expect(authnClient.authn).type.toEqual<AuthnTransactionAPI>();
expect(authnClient.fingerprint).type.toEqual<FingerprintAPI>();

// does not include OAuth
expect(authnClient).type.not.toHaveProperty('token');

// does not include Core
expect(authnClient).type.not.toHaveProperty('authStateManager');

// test async methods
expect(await authnClient.fingerprint()).type.toEqual<string>();
expect(await authnClient.signIn({})).type.toEqual<AuthnTransaction>();
expect(authnClient.signInWithCredentials({})).type.toRaiseError(); // must provide credentials
expect(await authnClient.signInWithCredentials({ username: 'foo', password: 'blah' })).type.toEqual<AuthnTransaction>();
expect(await authnClient.forgotPassword({})).type.toEqual<AuthnTransaction>();
expect(await authnClient.unlockAccount({ username: 'foo', factorType: 'SMS' })).type.toEqual<AuthnTransaction>();
expect(await authnClient.verifyRecoveryToken({ recoveryToken: 'foo' })).type.toEqual<AuthnTransaction>();

// Create an OAuth base class
const oauthOptions: OktaAuthOAuthOptions = { ...baseOptions };
const OAuthOptions: OktaAuthOauthOptionsConstructor = createOAuthOptionsConstructor();
const OAuthStorageManager: OAuthStorageManagerConstructor = createOAuthStorageManager();
const TransactionManager: TransactionManagerConstructor = createTransactionManager();
const OktaAuthOAuth = createOktaAuthOAuth(OAuthStorageManager, OAuthOptions, TransactionManager);

const OktaAuthOAuthWithAuthn = mixinAuthn(OktaAuthOAuth);
const oauthClient = new OktaAuthOAuthWithAuthn(httpOptions);

// includes OAuth
expect(oauthClient.token).type.toEqual<TokenAPI>();

// includes authn
expect<OktaAuthTxInterface>().type.toBeAssignable(oauthClient);
expect(oauthClient.tx).type.toEqual<AuthnTransactionAPI>();
expect(oauthClient.authn).type.toEqual<AuthnTransactionAPI>();
expect(oauthClient.fingerprint).type.toEqual<FingerprintAPI>();
