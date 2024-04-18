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
  EnrollAuthenticatorOptions,
  TokenResponse,
  JWTObject,
  RefreshToken,
  OktaAuth,
  JWTPayload,
} from '@okta/okta-auth-js';
import { expect } from 'tstyche';

const authClient = new OktaAuth({issuer: 'https://{yourOktaDomain}/oauth2/default'});

// Tokens
const idTokenExample = {
  expiresAt: 1449699930,
  scopes: ['openid', 'email'],
  authorizeUrl: 'https://{yourOktaDomain}/oauth2/v1/authorize',
  idToken: 'TOKEN_JWT',
  claims: { /* token claims */ } as UserClaims,
  issuer: 'https://{yourOktaDomain}',
  clientId: 'NPSfOkH5eZrTy8PMDlvx',
  pendingRemove: true,
};
expect<IDToken>().type.toBeAssignable(idTokenExample);

const accessTokenExample = {
  expiresAt: 1449699930,
  scopes: ['openid', 'email'],
  authorizeUrl: 'https://{yourOktaDomain}/oauth2/v1/authorize',
  accessToken: 'TOKEN_JWT',
  claims: { /* token claims */ } as UserClaims,
  tokenType: 'aud',
  userinfoUrl: 'https://some.com/userinfo',
  pendingRemove: true,
};
expect<AccessToken>().type.toBeAssignable(accessTokenExample);

const refreshTokenExample = {
  expiresAt: 1449699930,
  scopes: ['openid', 'email'],
  authorizeUrl: 'https://{yourOktaDomain}/oauth2/v1/authorize',
  refreshToken: 'TOKEN_JWT',
  tokenUrl: 'https://some.com/token',
  issuer: 'https://{yourOktaDomain}',
  pendingRemove: false,
};
expect<RefreshToken>().type.toBeAssignable(refreshTokenExample);

const DEFAULT_ACR_VALUES = 'urn:okta:2fa:any:ifpossible';

const tokens = {
  accessToken: accessTokenExample,
  idToken: idTokenExample,
  refreshToken: refreshTokenExample,
};

const authorizeOptions: TokenParams = {
  responseType: ['token', 'id_token'],
};

const tokenRes = await authClient.token.getWithoutPrompt(authorizeOptions);
expect(tokenRes).type.toEqual<TokenResponse>();
expect(tokenRes.tokens).type.toEqual<Tokens>();
expect(tokenRes.tokens.accessToken!).type.toEqual<AccessToken>();
expect(tokenRes.tokens.idToken!).type.toEqual<IDToken>();
expect(tokenRes.tokens.refreshToken!).type.toEqual<RefreshToken>();

expect(await authClient.token.getWithPopup(authorizeOptions)).type.toEqual<TokenResponse>();
expect(await authClient.token.getWithRedirect(authorizeOptions)).type.toEqual<void>();
expect(await authClient.token.parseFromUrl()).type.toEqual<TokenResponse>();

const enrollAuthenticatorOptons: EnrollAuthenticatorOptions = {
  enrollAmrValues: ['email', 'kba'],
  acrValues: DEFAULT_ACR_VALUES
};
const enrollAuthenticatorOptons2: EnrollAuthenticatorOptions = {
  enrollAmrValues: 'email',
  acrValues: DEFAULT_ACR_VALUES,
  responseType: 'none'
};
expect(authClient.endpoints.authorize.enrollAuthenticator(enrollAuthenticatorOptons)).type.toEqual<void>();
expect(authClient.endpoints.authorize.enrollAuthenticator(enrollAuthenticatorOptons2)).type.toEqual<void>();
expect(authClient.endpoints.authorize.enrollAuthenticator({
    enrollAmrValues: ['email', 'kba'],
  })
).type.toRaiseError();
expect(authClient.endpoints.authorize.enrollAuthenticator({
    acrValues: DEFAULT_ACR_VALUES
  })
).type.toRaiseError();
expect(authClient.endpoints.authorize.enrollAuthenticator()).type.toRaiseError();

const customUrls = {
  issuer: 'https://{yourOktaDomain}/oauth2/{authorizationServerId}',
  authorizeUrl: 'https://{yourOktaDomain}/oauth2/v1/authorize',
  userinfoUrl: 'https://{yourOktaDomain}/oauth2/v1/userinfo',
  tokenUrl: 'https://{yourOktaDomain}/oauth2/v1/userinfo',
  revokeUrl: 'https://{yourOktaDomain}/oauth2/v1/revoke',
  logoutUrl: 'https://{yourOktaDomain}/oauth2/v1/logout',
};

expect(await authClient.token.exchangeCodeForTokens(authorizeOptions, customUrls)).type.toEqual<TokenResponse>();

const decodedToken = authClient.token.decode('ID_TOKEN_JWT');
expect(decodedToken).type.toEqual<JWTObject>();
expect(decodedToken.payload).type.toEqual<JWTPayload>();
expect(decodedToken.header.alg).type.toEqual<string>();
expect(decodedToken.signature).type.toEqual<string>();

expect(await authClient.token.renew(accessTokenExample)).type.toEqual<Token | undefined>();

const userInfo = await authClient.token.getUserInfo(accessTokenExample, idTokenExample);
expect(userInfo).type.toEqual<UserClaims>();

const validationOptions = {
  issuer: 'https://{yourOktaDomain}/oauth2/{authorizationServerId}'
};
expect(await authClient.token.verify(idTokenExample, validationOptions)).type.toEqual<IDToken>();

expect(await authClient.token.prepareTokenParams(authorizeOptions)).type.toEqual<TokenParams>();


// UserClaims
const basicUserClaims = await authClient.getUser();
expect(basicUserClaims).type.toEqual<UserClaims>();

type MyCustomClaims = {
  groups: string[];
  isAdmin: boolean;
  age: number;
  applicationProfile: {
    companyId: string;
    family_name: string;
    given_name: string;
    locale: string;
    name: string;
    userId: number;
    userName: string;
    zoneinfo: string;
  };
  optional?: string;
  pair: [{
    foo: string
  }, {
    bar: boolean
  }]
};

const customUserClaims = await authClient.getUser<MyCustomClaims>();
expect(customUserClaims).type.toEqual<UserClaims<MyCustomClaims>>();

expect<UserClaims<{ func: () => boolean }>>().type.toRaiseError();
