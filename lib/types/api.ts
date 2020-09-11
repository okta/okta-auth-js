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
 */

import { AuthTransaction } from '../tx/AuthTransaction';
import { Token, AccessToken, IDToken } from './Token';
import { JWTObject } from './JWT';
import { UserClaims } from './UserClaims';
import { CustomUrls, OktaAuthOptions } from './OktaAuthOptions';

export interface OktaAuth {
  options: OktaAuthOptions;
  userAgent: string;
  getIssuerOrigin(): string;

  // Browser only
  features?: FeaturesAPI;
  token?: TokenAPI;
}

export interface APIError {
  errorSummary: string;
  errorCode: string;
  errorLink: string;
  errorId: string;
  errorCauses: string[];
}

// Transaction API

export type TransactionExistsFunction = () => boolean;
export interface TransactionExists extends TransactionExistsFunction {
  _get: (key: string) => string;
}

export interface TransactionAPI {
  exists: TransactionExists;
  status: (args?: object) => Promise<object>;
  resume: (args?: object) => Promise<AuthTransaction>;
  introspect: (args?: object) => Promise<AuthTransaction>;
}

// Fingerprint
export interface FingerprintOptions {
  timeout?: number;
}

export type FingerprintAPI = (options?: FingerprintOptions) => Promise<string>;

// Session API
export interface SessionObject {
  status: string;
  refresh?: () => Promise<any>;
  user?: () => Promise<any>;
}

export interface SessionAPI {
  close: () => Promise<object>;
  exists: () => Promise<boolean>;
  get: () => Promise<SessionObject>;
  refresh: () => Promise<object>;
  setCookieAndRedirect: (sessionToken?: string, redirectUri?: string) => void;
}

export interface TokenParams extends CustomUrls {
  pkce?: boolean;
  clientId?: string;
  redirectUri?: string;
  responseType?: string | string[];
  responseMode?: string;
  state?: string;
  nonce?: string;
  scopes?: string[];
  display?: string;
  ignoreSignature?: boolean;
  codeChallengeMethod?: string;
  codeVerifier?: string;
  authorizationCode?: string;
  codeChallenge?: string;
  idp?: string;
  idpScope?: string | string[];
  loginHint?: string;
  maxAge?: string | number;
  prompt?: string;
  sessionToken?: string;
  timeout?: number;
  popupTitle?: string;
}

export interface Tokens {
  accessToken?: AccessToken;
  idToken?: IDToken;
}

export interface TokenResponse {
  tokens: Tokens;
  state: string;
}

export interface ParseFromUrlOptions {
  url?: string;
  responseMode?: string;
}

export type ParseFromUrlFunction = () => Promise<TokenResponse>;

export interface ParseFromUrlInterface extends ParseFromUrlFunction {
  _getDocument: () => Document;
  _getLocation: () => Location;
  _getHistory: () => History;
}

export type GetWithRedirectFunction = (params?: TokenParams) => Promise<void>;

export interface GetWithRedirectAPI extends GetWithRedirectFunction {
  _setLocation: (loc: string) => void;
}

export interface TokenAPI {
  getUserInfo(accessToken?: AccessToken, idToken?: IDToken): Promise<UserClaims>;
  getWithRedirect: GetWithRedirectAPI;
  parseFromUrl: ParseFromUrlInterface;
  getWithoutPrompt(params?: TokenParams): Promise<TokenResponse>;
  getWithPopup(params?: TokenParams): Promise<TokenResponse>;
  decode(token: string): JWTObject;
  revoke(token: AccessToken): Promise<object>;
  renew(token: Token): Promise<Token>;
  renewTokens(): Promise<Tokens>;
  verify(token: IDToken, params?: object): Promise<IDToken>;
  isLoginRedirect(): boolean;
}

export interface TokenVerifyParams {
  clientId: string;
  issuer: string;
  ignoreSignature?: boolean;
  nonce?: string;
  accessToken?: string; // raw access token string
}

export interface IDTokenAPI {
  authorize: {
    _getLocationHref: () => string;
  };
}


export interface FeaturesAPI {
  isLocalhost(): boolean;
  isHTTPS(): boolean;
  isPopupPostMessageSupported(): boolean;
  hasTextEncoder(): boolean;
  isTokenVerifySupported(): boolean;
  isPKCESupported(): boolean;
}

// TODO: deprecate
export type SigninOptions = SignInWithCredentialsOptions; 

export interface SignInWithCredentialsOptions {
  username: string;
  password: string;
  relayState?: string;
  context?: string;
}

export function isSignInWithCredentialsOptions(obj: any): obj is SignInWithCredentialsOptions {
  return obj && obj.username && obj.password;
} 

export interface SigninWithRedirectOptions extends TokenParams {
  fromUri?: string;
}

export interface SigninAPI {
  signIn(opts?: SignInWithCredentialsOptions|SigninWithRedirectOptions): Promise<AuthTransaction>|Promise<void>;
}

export interface SignoutOptions {
  postLogoutRedirectUri?: string;
  accessToken?: AccessToken;
  revokeAccessToken?: boolean;
  idToken?: IDToken;
  state?: string;
}

export interface SignoutAPI {
  signOut(opts: SignoutOptions);
}

export interface ForgotPasswordOptions {
  username: string;
  relayState?: string;
}

export interface VerifyRecoveryTokenOptions {
  relayState?: string;
}