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
  Token,
  Tokens,
  TokenManager,
  RefreshToken,
  OktaAuth
} from '@okta/okta-auth-js';
import { expectType, expectAssignable } from 'tsd';

const authClient = new OktaAuth();

(async () => {
  const tokenManager = authClient.tokenManager;
  expectType<TokenManager>(tokenManager);

  // Get
  const tokens = await tokenManager.getTokens();
  expectType<Tokens>(tokens);
  const accessToken = await tokenManager.get('accessToken') as AccessToken;
  expectType<AccessToken>(accessToken);
  const idToken = await tokenManager.get('idToken') as IDToken;
  expectType<IDToken>(idToken);
  const refreshToken = await tokenManager.get('refreshToken') as RefreshToken;
  expectType<RefreshToken>(refreshToken);

  // Manage
  tokenManager.setTokens(tokens);
  expectType<void>(tokenManager.add('accessToken', tokens.accessToken));
  expectType<void>(tokenManager.remove('accessToken'));
  expectType<void>(tokenManager.clear());

  // Renew
  expectType<boolean>(tokenManager.hasExpired(accessToken));
  expectType<Token>(await tokenManager.renew('idToken'));

  // Events
  tokenManager.on('expired', function (key, expiredToken) {
    expectType<string>(key);
    expectType<Token>(expiredToken);
  });
  tokenManager.on('renewed', function (key, newToken, oldToken) {
    expectType<string>(key);
    expectType<Token>(newToken);
    expectType<Token>(oldToken);
  });
  tokenManager.on('error', function (error) {
    expectAssignable<object>(error);
  });
  tokenManager.off('error', () => {});
  tokenManager.off('error');
})();
