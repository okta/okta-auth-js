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
  OktaAuthOptions,
  OktaAuthHttpInterface,
  HttpAPI,
  OktaAuthIdxOptions,
  IdxStorageManagerInterface,
  IdxAPI,
  TokenAPI,
  WebauthnAPI
} from '@okta/okta-auth-js/idx';
import { expect } from 'tstyche';

const options: OktaAuthOptions = {issuer: 'https://{yourOktaDomain}/oauth2/default'};
const authClient = new OktaAuth(options);

// includes Http
expect<OktaAuthHttpInterface>().type.toBeAssignable(authClient);
expect(authClient.http).type.toEqual<HttpAPI>();

// includes OAuth
expect(authClient.token).type.toEqual<TokenAPI>();

// has IDX
expect(authClient.options).type.toEqual<OktaAuthIdxOptions>();
expect(authClient.options).type.toEqual<OktaAuthOptions>(); // test alias
expect(authClient.idx).type.toEqual<IdxAPI>();
expect(authClient.storageManager).type.toEqual<IdxStorageManagerInterface>();

// does not include Authn
expect(authClient).type.not.toHaveProperty('authn');

// has Webauthn
expect(OktaAuth.webauthn).type.toEqual<WebauthnAPI>();
