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
import { expectType } from 'tsd';

const authClient = new OktaAuth({});

(async () => {
  // Session API
  expectType<void>(authClient.session.setCookieAndRedirect('SESSION_TOKEN', 'https://some.com/redirect'));
  expectType<boolean>(await authClient.session.exists());
  const session = await authClient.session.get();
  expectType<SessionObject>(session);
  expectType<object>(await authClient.session.close());
  expectType<object>(await authClient.session.refresh());

  // Session
  expectType<string>(session.status);
  expectType<object>(await session.user!());
  expectType<object>(await session.refresh!());
})();
