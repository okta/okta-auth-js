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
  OktaUserAgent,
  OktaAuthCoreOptions,
  CoreStorageManagerInterface
} from '@okta/okta-auth-js/core';
import { expect } from 'tstyche';

const options: OktaAuthOptions = {issuer: 'https://{yourOktaDomain}/oauth2/default'};
const authClient = new OktaAuth(options);

expect<OktaAuthHttpInterface>().type.toBeAssignable(authClient);

expect(authClient.options).type.toEqual<OktaAuthCoreOptions>();
expect(authClient.options).type.toEqual<OktaAuthOptions>(); // test alias
expect(authClient.http).type.toEqual<HttpAPI>();
expect(authClient.storageManager).type.toEqual<CoreStorageManagerInterface>();
expect(authClient._oktaUserAgent).type.toEqual<OktaUserAgent>();

expect(authClient.getIssuerOrigin()).type.toEqual<string>();
expect(authClient.setHeaders({ foo: 'bar' })).type.toEqual<void>();

// test async methods
expect(await authClient.webfinger({})).type.toEqual<object>();
