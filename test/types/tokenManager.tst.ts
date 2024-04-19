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
  Token,
  Tokens,
  RefreshToken,
  OktaAuth,
  TokenManagerError,
  TokenManagerInterface
} from '@okta/okta-auth-js';
import { expect } from 'tstyche';

const authClient = new OktaAuth({issuer: 'https://{yourOktaDomain}/oauth2/default'});

(async () => {
  const tokenManager = authClient.tokenManager;
  expect(tokenManager).type.toEqual<TokenManagerInterface>();

  // Get
  const tokens = await tokenManager.getTokens();
  expect(tokens).type.toEqual<Tokens>();
  const accessToken = await tokenManager.get('accessToken') as AccessToken;
  expect(accessToken).type.toEqual<AccessToken>();
  const idToken = await tokenManager.get('idToken') as IDToken;
  expect(idToken).type.toEqual<IDToken>();
  const refreshToken = await tokenManager.get('refreshToken') as RefreshToken;
  expect(refreshToken).type.toEqual<RefreshToken>();

  // Manage
  tokenManager.setTokens(tokens);
  expect(tokenManager.add('accessToken', tokens.accessToken!)).type.toEqual<void>();
  expect(tokenManager.remove('accessToken')).type.toEqual<void>();
  expect(tokenManager.clear()).type.toEqual<void>();

  // Renew
  expect(tokenManager.hasExpired(accessToken)).type.toEqual<boolean>();
  expect(await tokenManager.renew('idToken')).type.toEqual<Token | undefined>();

  expect(tokenManager.clearPendingRemoveTokens()).type.toEqual<void>();

  // Events
  tokenManager.on('expired', function (key, expiredToken) {
    expect(key).type.toEqual<string>();
    expect(expiredToken).type.toEqual<Token>();
  });
  tokenManager.on('renewed', function (key, newToken, oldToken) {
    expect(key).type.toEqual<string>();
    expect(newToken).type.toEqual<Token>();
    expect(oldToken!).type.toEqual<Token>();
  });
  tokenManager.on('error', function (error: TokenManagerError) {
    expect(error).type.toEqual<TokenManagerError>();
    expect<Error>().type.toBeAssignable(error);
  });
  tokenManager.off('error', () => {});
  tokenManager.off('error');
})();
