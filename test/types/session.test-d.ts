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
import { SessionObject, OktaAuth } from '@okta/okta-auth-js';
import { expect } from 'tstyche';

const authClient = new OktaAuth({issuer: 'https://{yourOktaDomain}/oauth2/default'});

// Session API
expect(authClient.session.setCookieAndRedirect('SESSION_TOKEN', 'https://some.com/redirect')).type.toEqual<void>();
expect(await authClient.session.exists()).type.toEqual<boolean>();
const session = await authClient.session.get();
expect(session).type.toEqual<SessionObject>();
expect(await authClient.session.close()).type.toEqual<object>();
expect(await authClient.session.refresh()).type.toEqual<object>();

// Session
expect(session.status).type.toEqual<string>();
expect(await session.user!()).type.toEqual<object>();
expect(await session.refresh!()).type.toEqual<object>();
