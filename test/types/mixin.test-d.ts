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

import { expectType, expectAssignable, expectError } from 'tsd';

const baseOptions: OktaAuthBaseOptions = { devMode: true };
const BaseOptions: OktaAuthOptionsConstructor<OktaAuthBaseOptions> = createBaseOptionsConstructor();
const OktaAuthBase = createOktaAuthBase(BaseOptions);

const baseClient = new OktaAuthBase(baseOptions);
expectAssignable<OktaAuthBaseOptions>(baseClient.options);
expectAssignable<FeaturesAPI>(baseClient.features);

expectError(mixinIdx(OktaAuthBase));

const oauthOptions: OktaAuthOAuthOptions = { ...baseOptions };
const OAuthOptions: OktaAuthOauthOptionsConstructor = createOAuthOptionsConstructor();
const OAuthStorageManager: OAuthStorageManagerConstructor = createOAuthStorageManager();
const TransactionManager: TransactionManagerConstructor = createTransactionManager();
const OktaAuthOAuth = createOktaAuthOAuth(OAuthStorageManager, OAuthOptions, TransactionManager);
const oauthClient = new OktaAuthOAuth();

// includes Http
expectAssignable<OktaAuthHttpInterface>(oauthClient);
expectType<HttpAPI>(oauthClient.http);

// includes OAuth
expectType<OktaAuthOAuthOptions>(oauthClient.options);
expectType<TokenAPI>(oauthClient.token);
expectType<TransactionManagerInterface>(oauthClient.transactionManager);

// does not include Authn
expectError<undefined>(oauthClient.authn);

// does not include Idx
expectError<undefined>(oauthClient.idx);

// does not include MyAccount
expectError<undefined>(oauthClient.myaccount);

// cannot mixin IDX (mismatching storage)
expectError(mixinIdx(OktaAuthOAuth));

// Create a base class that CAN mixin IDX
const IdxOptions: OktaAuthIdxOptionsConstructor = createIdxOptionsConstructor();
const IdxStorageManager: IdxStorageManagerConstructor = createIdxStorageManager();
const IdxTransactionManager: IdxTransactionManagerConstructor = createIdxTransactionManager();
let OAuthBaseWithIdxStorage = createOktaAuthOAuth(IdxStorageManager, IdxOptions, IdxTransactionManager);

// Add IDX
const OktaAuthWithIdx = mixinIdx(OAuthBaseWithIdxStorage);
let idxClient = new OktaAuthWithIdx();


// has IDX
expectType<OktaAuthIdxOptions>(idxClient.options);
expectType<IdxAPI>(idxClient.idx);
expectType<IdxStorageManagerInterface>(idxClient.storageManager);

// still includes OAuth
expectType<TokenAPI>(idxClient.token);

// still does not include Authn
expectError<undefined>(idxClient.authn);


// Add MyAccount
const OktaAuthWithIdxAndMyAccount = mixinMyAccount(OktaAuthWithIdx);
let comboClient = new OktaAuthWithIdxAndMyAccount();

// has IDX
expectAssignable<OktaAuthIdxOptions>(comboClient.options);
expectType<IdxAPI>(comboClient.idx);

// has MyAccount
expectAssignable<OktaAuthMyAccountInterface>(comboClient);

// still includes OAuth
expectType<TokenAPI>(comboClient.token);

// still does not include Authn
expectError<undefined>(comboClient.authn);
