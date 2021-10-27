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
import StorageManager from '../StorageManager';
import { CustomUrls } from './OktaAuthOptions';
export interface TransactionManagerOptions {
    storageManager: StorageManager;
    legacyWidgetSupport?: boolean;
    saveNonceCookie?: boolean;
    saveStateCookie?: boolean;
    saveParamsCookie?: boolean;
}
export interface TransactionMetaOptions {
    pkce?: boolean;
    oauth?: boolean;
}
export interface OAuthTransactionMeta {
    issuer: string;
    redirectUri: string;
    state: string;
    nonce: string;
    responseType: string | string[];
    scopes: string[];
    clientId: string;
    urls: CustomUrls;
    ignoreSignature: boolean;
}
export interface PKCETransactionMeta extends OAuthTransactionMeta {
    codeVerifier: string;
    codeChallengeMethod: string;
    codeChallenge: string;
}
export interface IdxTransactionMeta extends PKCETransactionMeta {
    interactionHandle?: string;
    remediations?: string[];
}
export declare type CustomAuthTransactionMeta = Record<string, string | undefined>;
export declare type TransactionMeta = IdxTransactionMeta | PKCETransactionMeta | OAuthTransactionMeta | CustomAuthTransactionMeta;
export declare function isOAuthTransactionMeta(obj: any): obj is OAuthTransactionMeta;
export declare function isPKCETransactionMeta(obj: any): obj is PKCETransactionMeta;
export declare function isIdxTransactionMeta(obj: any): obj is IdxTransactionMeta;
export declare function isCustomAuthTransactionMeta(obj: any): obj is CustomAuthTransactionMeta;
export declare function isTransactionMeta(obj: any): obj is TransactionMeta;
