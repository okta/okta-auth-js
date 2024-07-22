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
  AccessToken,
  IDToken,
  RefreshToken,
  AuthState,
  OktaAuth
} from '@okta/okta-auth-js';
import { expect} from 'tstyche';

const authClient = new OktaAuth({issuer: 'https://{yourOktaDomain}/oauth2/default'});

(async () => {
  const authStateManager = authClient.authStateManager;

  const handler = (authState: AuthState) => {};
  authStateManager.subscribe(handler);
  authStateManager.unsubscribe(handler);
  authStateManager.unsubscribe();

  await authStateManager.updateAuthState();

  const authState = authStateManager.getAuthState()!;

  expect(authStateManager.getPreviousAuthState()!).type.toEqual<AuthState>();
  expect(authState).type.toEqual<AuthState>();
  expect(authState.accessToken!).type.toEqual<AccessToken>();
  expect(authState.idToken!).type.toEqual<IDToken>();
  expect(authState.refreshToken!).type.toEqual<RefreshToken>();
  expect(authState.isAuthenticated!).type.toEqual<boolean>();
  expect(authState.error!.message).type.toEqual<string>();
})();
