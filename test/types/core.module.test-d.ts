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
import { expectType, expectAssignable } from 'tsd';

const options: OktaAuthOptions = {issuer: 'https://{yourOktaDomain}/oauth2/default'};
const authClient = new OktaAuth(options);

expectAssignable<OktaAuthHttpInterface>(authClient);

expectType<OktaAuthCoreOptions>(authClient.options);
expectType<OktaAuthOptions>(authClient.options); // test alias
expectType<HttpAPI>(authClient.http);
expectType<CoreStorageManagerInterface>(authClient.storageManager);
expectType<OktaUserAgent>(authClient._oktaUserAgent);

expectType<string>(authClient.getIssuerOrigin());
expectType<void>(authClient.setHeaders({ foo: 'bar' }));

// test async methods
(async () => {
  expectType<object>(await authClient.webfinger({}));
})();
