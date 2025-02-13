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
  HttpAPI,
  IdxAPI,
  IdxStorageManagerInterface,
  OktaAuthHttpInterface,
  OktaAuthMyAccountInterface,
  OktaAuthOptions,
  TokenAPI,
  mixinIdx,
  OktaAuthIdxOptions,
  mixinMyAccount,
  createOktaAuthBase,
  createBaseOptionsConstructor,
  OktaAuthBaseOptions,
  FeaturesAPI,
  OktaAuthOAuthOptions,
  createOAuthOptionsConstructor,
  createOktaAuthOAuth,
  createOAuthStorageManager,
  createIdxStorageManager,
  createIdxOptionsConstructor,
  createTransactionManager,
  createIdxTransactionManager,
  OktaAuthOptionsConstructor,
  TransactionManagerConstructor,
  IdxTransactionManagerConstructor,
  IdxStorageManagerConstructor,
  OktaAuthIdxOptionsConstructor,
  OktaAuthOauthOptionsConstructor,
  OAuthStorageManagerConstructor,
  TransactionManagerInterface
} from '@okta/okta-auth-js';

import { expect } from 'tstyche';

const baseOptions: OktaAuthBaseOptions = { devMode: true };
const BaseOptions: OktaAuthOptionsConstructor<OktaAuthBaseOptions> = createBaseOptionsConstructor();
const OktaAuthBase = createOktaAuthBase(BaseOptions);

const baseClient = new OktaAuthBase(baseOptions);
expect<OktaAuthBaseOptions>().type.toBeAssignable(baseClient.options);
expect<FeaturesAPI>().type.toBeAssignable(baseClient.features);

expect(mixinIdx(OktaAuthBase)).type.toRaiseError();

const oauthOptions: OktaAuthOAuthOptions = { ...baseOptions, pollDelay: 500 };
const OAuthOptions: OktaAuthOauthOptionsConstructor = createOAuthOptionsConstructor();
const OAuthStorageManager: OAuthStorageManagerConstructor = createOAuthStorageManager();
const TransactionManager: TransactionManagerConstructor = createTransactionManager();
const OktaAuthOAuth = createOktaAuthOAuth(OAuthStorageManager, OAuthOptions, TransactionManager);
const oauthClient = new OktaAuthOAuth();

// includes Http
expect<OktaAuthHttpInterface>().type.toBeAssignable(oauthClient);
expect(oauthClient.http).type.toEqual<HttpAPI>();

// includes OAuth
expect(oauthClient.options).type.toEqual<OktaAuthOAuthOptions>();
expect(oauthClient.token).type.toEqual<TokenAPI>();
expect(oauthClient.transactionManager).type.toEqual<TransactionManagerInterface>();

// does not include Authn
expect(oauthClient).type.not.toHaveProperty('authn');

// does not include Idx
expect(oauthClient).type.not.toHaveProperty('idx');

// does not include MyAccount
expect(oauthClient).type.not.toHaveProperty('myaccount');

// cannot mixin IDX (mismatching storage)
expect(mixinIdx(OktaAuthOAuth)).type.toRaiseError();

// Create a base class that CAN mixin IDX
const IdxOptions: OktaAuthIdxOptionsConstructor = createIdxOptionsConstructor();
const IdxStorageManager: IdxStorageManagerConstructor = createIdxStorageManager();
const IdxTransactionManager: IdxTransactionManagerConstructor = createIdxTransactionManager();
let OAuthBaseWithIdxStorage = createOktaAuthOAuth(IdxStorageManager, IdxOptions, IdxTransactionManager);

// Add IDX
const OktaAuthWithIdx = mixinIdx(OAuthBaseWithIdxStorage);
let idxClient = new OktaAuthWithIdx();


// has IDX
expect(idxClient.options).type.toEqual<OktaAuthIdxOptions>();
expect(idxClient.idx).type.toEqual<IdxAPI>();
expect(idxClient.storageManager).type.toEqual<IdxStorageManagerInterface>();

// still includes OAuth
expect(idxClient.token).type.toEqual<TokenAPI>();

// still does not include Authn
expect(idxClient).type.not.toHaveProperty('authn');


// Add MyAccount
const OktaAuthWithIdxAndMyAccount = mixinMyAccount(OktaAuthWithIdx);
let comboClient = new OktaAuthWithIdxAndMyAccount();

// has IDX
expect(comboClient.options).type.toBeAssignable<OktaAuthIdxOptions>();
expect(comboClient.idx).type.toEqual<IdxAPI>();

// has MyAccount
expect<OktaAuthMyAccountInterface>().type.toBeAssignable(comboClient);

// still includes OAuth
expect(comboClient.token).type.toEqual<TokenAPI>();

// still does not include Authn
expect(comboClient).type.not.toHaveProperty('authn');
