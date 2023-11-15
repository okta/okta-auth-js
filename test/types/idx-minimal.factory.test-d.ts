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
  OktaAuthHttpInterface,
  HttpAPI,
  OktaAuthIdxOptions,
  IdxStorageManagerInterface,
  BaseIdxAPI,
  BaseTokenAPI,
  WebauthnAPI,
  createOktaAuthBaseIdx,
  createIdxOptionsConstructor,
  createIdxStorageManager,
  createIdxTransactionManager,
  OktaAuthOptionsConstructor,
  IdxStorageManagerConstructor,
  IdxTransactionManagerConstructor,
} from '@okta/okta-auth-js/idx';
import { expectType, expectAssignable, expectError } from 'tsd';

const OptionsConstructor: OktaAuthOptionsConstructor<OktaAuthIdxOptions> = createIdxOptionsConstructor();
const StorageManager: IdxStorageManagerConstructor = createIdxStorageManager();
const TransactionManager: IdxTransactionManagerConstructor = createIdxTransactionManager();
const OktaAuth = createOktaAuthBaseIdx(StorageManager, OptionsConstructor, TransactionManager);
const options: OktaAuthIdxOptions = {};
const authClient = new OktaAuth(options);

// includes Http
expectAssignable<OktaAuthHttpInterface>(authClient);
expectType<HttpAPI>(authClient.http);

// includes base OAuth
expectType<BaseTokenAPI>(authClient.token);

// has IDX
expectType<OktaAuthIdxOptions>(authClient.options);
expectType<BaseIdxAPI>(authClient.idx);
expectType<IdxStorageManagerInterface>(authClient.storageManager);

// has partial IDX API
expectError<undefined>(authClient.idx.cancel);

// does not include Authn
expectError<undefined>(authClient.authn);

// has Webauthn
expectType<WebauthnAPI>(OktaAuth.webauthn);

// has partial core API
expectError<undefined>(authClient.start);

// has partial OAuth2 API
expectError<undefined>(authClient.pkce);
expectType<() => boolean>(authClient.isPKCE);

