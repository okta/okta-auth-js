/*!
 * Copyright (c) 2021-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { JWTObject } from './JWT';
import { OAuthTransactionMeta, PKCETransactionMeta } from './meta';
import { CustomUrls, OktaAuthOAuthOptions, SigninWithRedirectOptions, TokenParams } from './options';
import { OAuthResponseType } from './proto';
import { OAuthStorageManagerInterface } from './storage';
import { AccessToken, IDToken, RefreshToken, RevocableToken, Token, Tokens } from './Token';
import { TokenManagerInterface } from './TokenManager';
import { CustomUserClaims, UserClaims } from './UserClaims';
import { TransactionManagerInterface } from './TransactionManager';
import { OktaAuthSessionInterface } from '../../session/types';
import { Endpoints } from './endpoints';

export interface PopupParams {
  popupTitle?: string;
  popupWindow?: Window;
}

export interface TokenResponse {
  tokens: Tokens;
  state: string;
  code?: string;
  responseType?: OAuthResponseType | OAuthResponseType[] | 'none';
}

export interface ParseFromUrlOptions {
  url?: string;
  responseMode?: string;
}

export type ParseFromUrlFunction = (options?: string | ParseFromUrlOptions) => Promise<TokenResponse>;

export interface ParseFromUrlInterface extends ParseFromUrlFunction {
  _getDocument: () => Document;
  _getLocation: () => Location;
  _getHistory: () => History;
}

export type GetWithRedirectFunction = (params?: TokenParams) => Promise<void>;

export type SetLocationFunction = (loc: string) => void;

export interface BaseTokenAPI {
  decode(token: string): JWTObject;
  prepareTokenParams(params?: TokenParams): Promise<TokenParams>;
  exchangeCodeForTokens(params: TokenParams, urls?: CustomUrls): Promise<TokenResponse>;
}

export interface TokenAPI extends BaseTokenAPI {
  getUserInfo<S extends CustomUserClaims = CustomUserClaims>(
    accessToken?: AccessToken,
    idToken?: IDToken
  ): Promise<UserClaims<S>>;
  getWithRedirect: GetWithRedirectFunction;
  parseFromUrl: ParseFromUrlInterface;
  getWithoutPrompt(params?: TokenParams): Promise<TokenResponse>;
  getWithPopup(params?: TokenParams): Promise<TokenResponse>;
  revoke(token: RevocableToken): Promise<object>;
  renew(token: Token): Promise<Token | undefined>;
  renewTokens(options?: TokenParams): Promise<Tokens>;
  renewTokensWithRefresh(tokenParams: TokenParams, refreshTokenObject: RefreshToken): Promise<Tokens>;
  verify(token: IDToken, params?: object): Promise<IDToken>;
  isLoginRedirect(): boolean;
}

export interface TokenVerifyParams {
  clientId: string;
  issuer: string;
  ignoreSignature?: boolean;
  nonce?: string;
  accessToken?: string; // raw access token string
  acrValues?: string;
}

export interface IDTokenAPI {
  authorize: {
    _getLocationHref: () => string;
  };
}

export interface PkceAPI {
  DEFAULT_CODE_CHALLENGE_METHOD: string;
  generateVerifier(prefix: string): string;
  computeChallenge(str: string): PromiseLike<any>;
}

export interface IsAuthenticatedOptions {
  onExpiredToken?: 'renew' | 'remove' | 'none';
}

export interface SignoutRedirectUrlOptions {
  postLogoutRedirectUri?: string;
  idToken?: IDToken;
  state?: string;
}

export interface SignoutOptions extends SignoutRedirectUrlOptions {
  revokeAccessToken?: boolean;
  revokeRefreshToken?: boolean;
  accessToken?: AccessToken;
  refreshToken?: RefreshToken;
  clearTokensBeforeRedirect?: boolean;
}

export interface OriginalUriApi {
  getOriginalUri(state?: string): string | undefined;
  setOriginalUri(originalUri: string, state?: string): void;
  removeOriginalUri(state?: string): void;
}

export interface OktaAuthOAuthInterface
<
  M extends OAuthTransactionMeta = PKCETransactionMeta,
  S extends OAuthStorageManagerInterface<M> = OAuthStorageManagerInterface<M>,
  O extends OktaAuthOAuthOptions = OktaAuthOAuthOptions,
  TM extends TransactionManagerInterface = TransactionManagerInterface
> 
  extends OktaAuthSessionInterface<S, O>,
  OriginalUriApi
{
  token: TokenAPI;
  tokenManager: TokenManagerInterface;
  pkce: PkceAPI;
  transactionManager: TM;
  endpoints: Endpoints;
  
  isPKCE(): boolean;
  getIdToken(): string | undefined;
  getAccessToken(): string | undefined;
  getRefreshToken(): string | undefined;

  isAuthenticated(options?: IsAuthenticatedOptions): Promise<boolean>;
  signOut(opts?: SignoutOptions): Promise<boolean>;
  isLoginRedirect(): boolean;
  storeTokensFromRedirect(): Promise<void>;
  getUser<T extends CustomUserClaims = CustomUserClaims>(): Promise<UserClaims<T>>;
  signInWithRedirect(opts?: SigninWithRedirectOptions): Promise<void>;
  
  revokeAccessToken(accessToken?: AccessToken): Promise<unknown>;
  revokeRefreshToken(refreshToken?: RefreshToken): Promise<unknown>;
}
