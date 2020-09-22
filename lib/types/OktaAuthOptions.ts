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

import { StorageUtil } from './Storage';
import { CookieOptions } from './Cookies';
import { HttpRequestClient } from './http';
import { OktaAuth } from './';

export interface TokenManagerOptions {
  autoRenew?: boolean;
  autoRemove?: boolean;
  secure?: boolean;
  storage?: string;
  storageKey?: string;
  expireEarlySeconds?: number;
}

export interface CustomUserAgent {
  template?: string;
  value?: string;
}

export interface CustomUrls {
  issuer?: string;
  authorizeUrl?: string;
  userinfoUrl?: string;
  tokenUrl?: string;
  revokeUrl?: string;
  logoutUrl?: string;
}

export interface OktaAuthOptions extends CustomUrls {
  pkce?: boolean;
  clientId?: string;
  redirectUri?: string;
  responseType?: string | string[];
  responseMode?: string;
  scopes?: string[];
  ignoreSignature?: boolean;
  tokenManager?: TokenManagerOptions;
  postLogoutRedirectUri?: string;
  storageUtil?: StorageUtil;
  ajaxRequest?: object;
  httpRequestClient?: HttpRequestClient;
  userAgent?: CustomUserAgent;
  cookies?: CookieOptions;
  transformErrorXHR?: (xhr: object) => any;
  headers?: object;
  maxClockSkew?: number;
  isAuthenticated?: (oktaAuth: OktaAuth, isPending: boolean) => Promise<boolean>;
  devMode?: boolean; 
}