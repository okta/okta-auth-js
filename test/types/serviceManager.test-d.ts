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
import { OktaAuth, ServiceManagerInterface, ServiceInterface } from '@okta/okta-auth-js';
import { expect } from 'tstyche';

const authClient = new OktaAuth({issuer: 'https://{yourOktaDomain}/oauth2/default'});

// start/stop background services
expect(await authClient.start()).type.toEqual<void>();
expect(await authClient.stop()).type.toEqual<void>();

expect(authClient.serviceManager).type.toEqual<ServiceManagerInterface>();
expect(authClient.serviceManager.getService('serviceName')).type.toEqual<ServiceInterface | undefined>();
expect(authClient.serviceManager.isLeader()).type.toEqual<boolean>();
expect(authClient.serviceManager.isLeaderRequired()).type.toEqual<boolean>();
expect(await authClient.serviceManager.start()).type.toEqual<void>();
expect(await authClient.serviceManager.stop()).type.toEqual<void>();
