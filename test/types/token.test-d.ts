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
  UserClaims,
  TokenParams,
  TokenResponse,
  JWTObject,
  RefreshToken,
  OktaAuth,
  JWTPayload
} from '@okta/okta-auth-js';
import { expectType, expectAssignable } from 'tsd';

const authClient = new OktaAuth({});

// Tokens
const idTokenExample = {
  expiresAt: 1449699930,
  scopes: ['openid', 'email'],
  authorizeUrl: 'https://{yourOktaDomain}/oauth2/v1/authorize',
  idToken: 'TOKEN_JWT',
  claims: { /* token claims */ } as UserClaims,
  issuer: 'https://{yourOktaDomain}',
  clientId: 'NPSfOkH5eZrTy8PMDlvx'
};
expectAssignable<IDToken>(idTokenExample);

const accessTokenExample = {
  expiresAt: 1449699930,
  scopes: ['openid', 'email'],
  authorizeUrl: 'https://{yourOktaDomain}/oauth2/v1/authorize',
  accessToken: 'TOKEN_JWT',
  claims: { /* token claims */ } as UserClaims,
  tokenType: 'aud',
  userinfoUrl: 'https://some.com/userinfo'
};
expectAssignable<AccessToken>(accessTokenExample);

const refreshTokenExample = {
  expiresAt: 1449699930,
  scopes: ['openid', 'email'],
  authorizeUrl: 'https://{yourOktaDomain}/oauth2/v1/authorize',
  refreshToken: 'TOKEN_JWT',
  tokenUrl: 'https://some.com/token',
  issuer: 'https://{yourOktaDomain}'
};
expectAssignable<RefreshToken>(refreshTokenExample);

const tokens = {
  accessToken: accessTokenExample,
  idToken: idTokenExample,
  refreshToken: refreshTokenExample,
};

(async () => {
  const authorizeOptions: TokenParams = {
    responseType: ['token', 'id_token'],
  };

  const tokenRes = await authClient.token.getWithoutPrompt(authorizeOptions);
  expectType<TokenResponse>(tokenRes);
  expectType<Tokens>(tokenRes.tokens);
  expectType<AccessToken>(tokenRes.tokens.accessToken!);
  expectType<IDToken>(tokenRes.tokens.idToken!);
  expectType<RefreshToken>(tokenRes.tokens.refreshToken!);

  expectType<TokenResponse>(await authClient.token.getWithPopup(authorizeOptions));
  expectType<void>(await authClient.token.getWithRedirect(authorizeOptions));
  expectType<TokenResponse>(await authClient.token.parseFromUrl());

  const customUrls = {
    issuer: 'https://{yourOktaDomain}/oauth2/{authorizationServerId}',
    authorizeUrl: 'https://{yourOktaDomain}/oauth2/v1/authorize',
    userinfoUrl: 'https://{yourOktaDomain}/oauth2/v1/userinfo',
    tokenUrl: 'https://{yourOktaDomain}/oauth2/v1/userinfo',
    revokeUrl: 'https://{yourOktaDomain}/oauth2/v1/revoke',
    logoutUrl: 'https://{yourOktaDomain}/oauth2/v1/logout',
  };

  expectType<TokenResponse>(await authClient.token.exchangeCodeForTokens(authorizeOptions, customUrls));

  const decodedToken = authClient.token.decode('ID_TOKEN_JWT');
  expectType<JWTObject>(decodedToken);
  expectType<JWTPayload>(decodedToken.payload);
  expectType<string>(decodedToken.header.alg);
  expectType<string>(decodedToken.signature);

  expectType<Token | undefined>(await authClient.token.renew(accessTokenExample));

  const userInfo = await authClient.token.getUserInfo(accessTokenExample, idTokenExample);
  expectType<UserClaims>(userInfo);

  const validationOptions = {
    issuer: 'https://{yourOktaDomain}/oauth2/{authorizationServerId}'
  };
  expectType<IDToken>(await authClient.token.verify(idTokenExample, validationOptions));

  expectType<TokenParams>(await authClient.token.prepareTokenParams(authorizeOptions));
})();
