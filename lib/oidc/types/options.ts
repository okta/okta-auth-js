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

import { OktaAuthOptionsConstructor } from '../../base/types';
import { OktaAuthHttpOptions } from '../../http/types';
import { SimpleStorage } from '../../storage/types';
import { OktaAuthOAuthInterface, SetLocationFunction } from './api';
import { OAuthResponseMode, OAuthResponseType } from './proto';
import { Tokens } from './Token';
import { TransactionManagerOptions } from './Transaction';

export interface CustomUrls {
  issuer?: string;
  authorizeUrl?: string;
  userinfoUrl?: string;
  tokenUrl?: string;
  revokeUrl?: string;
  logoutUrl?: string;
}

export interface TokenParams extends CustomUrls {
  pkce?: boolean;
  clientId?: string;
  redirectUri?: string;
  responseType?: OAuthResponseType | OAuthResponseType[] | 'none';
  responseMode?: OAuthResponseMode;
  state?: string;
  nonce?: string;
  scopes?: string[];
  enrollAmrValues?: string | string[];
  display?: string;
  ignoreSignature?: boolean;
  codeVerifier?: string;
  authorizationCode?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  interactionCode?: string;
  idp?: string;
  idpScope?: string | string[];
  loginHint?: string;
  maxAge?: string | number;
  acrValues?: string;
  prompt?: string;
  sessionToken?: string;
  timeout?: number;
  extraParams?: { [propName: string]: string }; // custom authorize query params
  // TODO: remove in the next major version
  popupTitle?: string;
}

export interface TokenManagerOptions {
  autoRenew?: boolean;
  autoRemove?: boolean;
  clearPendingRemoveTokens?: boolean;
  secure?: boolean;
  storage?: string | SimpleStorage;
  storageKey?: string;
  expireEarlySeconds?: number;
  syncStorage?: boolean;
}

export interface EnrollAuthenticatorOptions extends TokenParams {
  enrollAmrValues: string | string[];
  acrValues: string;
}

export interface SigninWithRedirectOptions extends TokenParams {
  originalUri?: string;
}

export interface RenewTokensParams extends TokenParams {
  tokens?: Tokens
}

export interface OktaAuthOAuthOptions extends
  OktaAuthHttpOptions,
  CustomUrls,
  Pick<TokenParams,
    'issuer' |
    'clientId' |
    'redirectUri' |
    'responseType' |
    'responseMode' |
    'scopes' |
    'state' |
    'pkce' |
    'ignoreSignature' |
    'codeChallenge' |
    'codeChallengeMethod' |
    'maxAge' |
    'acrValues'
  >
{
  ignoreLifetime?: boolean;
  tokenManager?: TokenManagerOptions;
  postLogoutRedirectUri?: string;
  maxClockSkew?: number;
  restoreOriginalUri?: (oktaAuth: OktaAuthOAuthInterface, originalUri?: string) => Promise<void>;

  transactionManager?: TransactionManagerOptions;

  // For server-side web applications ONLY!
  clientSecret?: string;
  setLocation?: SetLocationFunction;
}

export type OktaAuthOauthOptionsConstructor = OktaAuthOptionsConstructor<OktaAuthOAuthOptions>;
