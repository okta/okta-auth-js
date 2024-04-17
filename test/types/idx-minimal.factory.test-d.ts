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
  MinimalIdxAPI,
  BaseTokenAPI,
  WebauthnAPI,
  createMinimalOktaAuthIdx,
  createIdxOptionsConstructor,
  createIdxStorageManager,
  createIdxTransactionManager,
  OktaAuthOptionsConstructor,
  IdxStorageManagerConstructor,
  IdxTransactionManagerConstructor,
} from '@okta/okta-auth-js/idx';
import { expect } from 'tstyche';

const OptionsConstructor: OktaAuthOptionsConstructor<OktaAuthIdxOptions> = createIdxOptionsConstructor();
const StorageManager: IdxStorageManagerConstructor = createIdxStorageManager();
const TransactionManager: IdxTransactionManagerConstructor = createIdxTransactionManager();
const OktaAuth = createMinimalOktaAuthIdx(StorageManager, OptionsConstructor, TransactionManager);
const options: OktaAuthIdxOptions = {issuer: 'https://{yourOktaDomain}/oauth2/default'};
const authClient = new OktaAuth(options);

// includes Http
expect<OktaAuthHttpInterface>().type.toBeAssignable(authClient);
expect(authClient.http).type.toEqual<HttpAPI>();

// includes base OAuth
expect(authClient.token).type.toEqual<BaseTokenAPI>();

// has IDX
expect(authClient.options).type.toEqual<OktaAuthIdxOptions>();
expect(authClient.idx).type.toEqual<MinimalIdxAPI>();
expect(authClient.storageManager).type.toEqual<IdxStorageManagerInterface>();

// has partial IDX API
expect(authClient.idx.cancel).type.toRaiseError();

// does not include Authn
expect(authClient.authn).type.toRaiseError();

// has Webauthn
expect(OktaAuth.webauthn).type.toEqual<WebauthnAPI>();

// has no core API
expect(authClient.start).type.toRaiseError();

// has partial OAuth API
expect(authClient.pkce).type.toRaiseError();
expect(authClient.isPKCE).type.toEqual<() => boolean>();

