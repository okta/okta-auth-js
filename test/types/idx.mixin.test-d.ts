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
  IdxAPI,
  IdxStorageManagerInterface,
  TokenAPI,
  mixinIdx,
  OktaAuthIdxOptions,
  createOktaAuthBase,
  createBaseOptionsConstructor,
  OktaAuthBaseOptions,
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
  createOktaAuthCore,
  AuthStateManagerInterface,
  WebauthnAPI
} from '@okta/okta-auth-js';
import { expect } from 'tstyche';

const baseOptions: OktaAuthBaseOptions = { devMode: true };
const BaseOptions: OktaAuthOptionsConstructor<OktaAuthBaseOptions> = createBaseOptionsConstructor();
const OktaAuthBase = createOktaAuthBase(BaseOptions);

// Cannot mixin on a Base interface
expect(mixinIdx(OktaAuthBase)).type.toRaiseError();

const oauthOptions: OktaAuthOAuthOptions = { ...baseOptions, enablePollDelay: true };
const OAuthOptions: OktaAuthOauthOptionsConstructor = createOAuthOptionsConstructor();
const OAuthStorageManager: OAuthStorageManagerConstructor = createOAuthStorageManager();
const TransactionManager: TransactionManagerConstructor = createTransactionManager();
const OktaAuthOAuth = createOktaAuthOAuth(OAuthStorageManager, OAuthOptions, TransactionManager);

// cannot mixin (mismatching storage)
expect(mixinIdx(OktaAuthOAuth)).type.toRaiseError();

// OAuth base with IDX storage
const IdxOptions: OktaAuthIdxOptionsConstructor = createIdxOptionsConstructor();
const IdxStorageManager: IdxStorageManagerConstructor = createIdxStorageManager();
const IdxTransactionManager: IdxTransactionManagerConstructor = createIdxTransactionManager();
const OAuthBaseWithIdxStorage = createOktaAuthOAuth(IdxStorageManager, IdxOptions, IdxTransactionManager);

// Add IDX
const OktaAuthWithIdx = mixinIdx(OAuthBaseWithIdxStorage);
const idxClient = new OktaAuthWithIdx();

// has Webauthn
expect(OktaAuthWithIdx.webauthn).type.toEqual<WebauthnAPI>();

// has IDX
expect(idxClient.options).type.toEqual<OktaAuthIdxOptions>();
expect(idxClient.idx).type.toEqual<IdxAPI>();
expect(idxClient.storageManager).type.toEqual<IdxStorageManagerInterface>();

// still includes OAuth
expect(idxClient.token).type.toEqual<TokenAPI>();

// does not include Core
expect(idxClient).type.not.toHaveProperty('authStateManager');

// Create a Core base class
const OAuthBaseWithCore = createOktaAuthCore(IdxStorageManager, IdxOptions, IdxTransactionManager);
const OktaAuthCoreWithIdx = mixinIdx(OAuthBaseWithCore);
const coreClient = new OktaAuthCoreWithIdx();

// has IDX
expect(coreClient.options).type.toEqual<OktaAuthIdxOptions>();
expect(coreClient.idx).type.toEqual<IdxAPI>();
expect(coreClient.storageManager).type.toEqual<IdxStorageManagerInterface>();

// still includes OAuth
expect(coreClient.token).type.toEqual<TokenAPI>();

// also includes Core
expect(coreClient.authStateManager).type.toBeAssignable<AuthStateManagerInterface>();
