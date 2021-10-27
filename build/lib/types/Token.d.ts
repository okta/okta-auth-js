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
    authorizeUrl: string;
    scopes: string[];
}
export interface AccessToken extends AbstractToken {
    accessToken: string;
    claims: UserClaims;
    tokenType: string;
    userinfoUrl: string;
}
export interface RefreshToken extends AbstractToken {
    refreshToken: string;
    tokenUrl: string;
    issuer: string;
}
export interface IDToken extends AbstractToken {
    idToken: string;
    claims: UserClaims;
    issuer: string;
    clientId: string;
}
export declare type Token = AccessToken | IDToken | RefreshToken;
export declare type RevocableToken = AccessToken | RefreshToken;
export declare type TokenType = 'accessToken' | 'idToken' | 'refreshToken';
export declare function isToken(obj: any): obj is Token;
export declare function isAccessToken(obj: any): obj is AccessToken;
export declare function isIDToken(obj: any): obj is IDToken;
export declare function isRefreshToken(obj: any): obj is RefreshToken;
export interface Tokens {
    accessToken?: AccessToken;
    idToken?: IDToken;
    refreshToken?: RefreshToken;
}
