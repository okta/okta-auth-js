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

import { StorageManagerOptions, StorageUtil, SimpleStorage } from './Storage';
import { CookieOptions } from './Cookies';
import { HttpRequestClient } from './http';
import { AuthState } from './AuthState';
import { TransactionManagerOptions } from './Transaction';
import { IdxTransactionMeta, RunOptions } from '../idx/types';
import { ServiceManagerOptions } from './Service';
import OktaAuth from '../OktaAuth';
import { OAuthResponseMode, OAuthResponseType } from './OAuth';


export interface IsAuthenticatedOptions {
  onExpiredToken?: 'renew' | 'remove' | 'none';
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
  responseType?: OAuthResponseType | OAuthResponseType[];
  responseMode?: OAuthResponseMode;
  state?: string;
  nonce?: string;
  scopes?: string[];
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
  prompt?: string;
  sessionToken?: string;
  timeout?: number;
  extraParams?: { [propName: string]: string }; // custom authorize query params
  // TODO: remove in the next major version
  popupTitle?: string;
}

export interface OktaAuthOptions extends
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
    'codeChallengeMethod'
  >,
  Pick<IdxTransactionMeta,
    'flow' |
    'activationToken' |
    'recoveryToken'
  >
{
  useInteractionCodeFlow?: boolean;
  ignoreLifetime?: boolean;
  tokenManager?: TokenManagerOptions;
  postLogoutRedirectUri?: string;
  storageUtil?: StorageUtil;
  ajaxRequest?: object;
  httpRequestClient?: HttpRequestClient;
  cookies?: CookieOptions;
  transformErrorXHR?: (xhr: object) => any;
  headers?: object;
  maxClockSkew?: number;
  transformAuthState?: (oktaAuth: OktaAuth, authState: AuthState) => Promise<AuthState>;
  restoreOriginalUri?: (oktaAuth: OktaAuth, originalUri?: string) => Promise<void>;
  devMode?: boolean;
  storageManager?: StorageManagerOptions;
  services?: ServiceManagerOptions;
  transactionManager?: TransactionManagerOptions;
  // BETA WARNING: configs in this section are subject to change without a breaking change notice
  idx?: Pick<RunOptions,
    'useGenericRemediator' |
    'exchangeCodeForTokens'
  >;
  
  // For server-side web applications ONLY!
  clientSecret?: string;
}