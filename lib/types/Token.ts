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

import { UserClaims } from './UserClaims';

export interface AbstractToken {
  expiresAt: number;
  value: string;
  authorizeUrl: string;
  scopes: string[];
}

export interface AccessToken extends AbstractToken {
  accessToken: string;
  tokenType: string;
  userinfoUrl: string;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IDToken extends AbstractToken {
  idToken: string;
  claims: UserClaims;
  issuer: string;
  clientId: string;
}

export type Token = AccessToken | IDToken;

export type TokenType = 'accessToken' | 'idToken';

export function isToken(obj: any): obj is Token {
  if (obj &&
      (obj.accessToken || obj.idToken) &&
      Array.isArray(obj.scopes)) {
    return true;
  }
  return false;
}

export function isAccessToken(obj: any): obj is AccessToken {
  return obj && obj.accessToken;
}

export function isIDToken(obj: any): obj is IDToken {
  return obj && obj.idToken;
}
