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
import { OktaAuth as SDKInterface, OktaAuthOptions, AccessToken, RefreshToken, TokenAPI, FeaturesAPI, SignoutAPI, FingerprintAPI, UserClaims, SigninWithRedirectOptions, SigninWithCredentialsOptions, SignoutOptions, Tokens, ForgotPasswordOptions, VerifyRecoveryTokenOptions, TransactionAPI, SessionAPI, SigninAPI, PkceAPI, SigninOptions, IdxAPI, SignoutRedirectUrlOptions, HttpAPI } from './types';
import { AuthTransaction } from './tx';
import { TokenManager } from './TokenManager';
import PromiseQueue from './PromiseQueue';
import { AuthStateManager } from './AuthStateManager';
import StorageManager from './StorageManager';
import TransactionManager from './TransactionManager';
import { OktaUserAgent } from './OktaUserAgent';
declare const Emitter: any;
declare class OktaAuth implements SDKInterface, SigninAPI, SignoutAPI {
    options: OktaAuthOptions;
    storageManager: StorageManager;
    transactionManager: TransactionManager;
    tx: TransactionAPI;
    idx: IdxAPI;
    userAgent: string;
    session: SessionAPI;
    pkce: PkceAPI;
    static features: FeaturesAPI;
    features: FeaturesAPI;
    token: TokenAPI;
    _tokenQueue: PromiseQueue;
    emitter: typeof Emitter;
    tokenManager: TokenManager;
    authStateManager: AuthStateManager;
    http: HttpAPI;
    fingerprint: FingerprintAPI;
    _oktaUserAgent: OktaUserAgent;
    _pending: {
        handleLogin: boolean;
    };
    constructor(args: OktaAuthOptions);
    start(): void;
    stop(): void;
    isInteractionRequired(): boolean;
    isInteractionRequiredError(error: Error): boolean;
    signIn(opts: SigninOptions): Promise<AuthTransaction>;
    signInWithCredentials(opts: SigninWithCredentialsOptions): Promise<AuthTransaction>;
    signInWithRedirect(opts?: SigninWithRedirectOptions): Promise<void>;
    closeSession(): Promise<object>;
    revokeAccessToken(accessToken?: AccessToken): Promise<object>;
    revokeRefreshToken(refreshToken?: RefreshToken): Promise<object>;
    getSignOutRedirectUrl(options?: SignoutRedirectUrlOptions): string;
    signOut(options?: SignoutOptions): Promise<void>;
    webfinger(opts: any): Promise<object>;
    isAuthenticated(): Promise<boolean>;
    getUser(): Promise<UserClaims>;
    getIdToken(): string | undefined;
    getAccessToken(): string | undefined;
    getRefreshToken(): string | undefined;
    /**
     * Store parsed tokens from redirect url
     */
    storeTokensFromRedirect(): Promise<void>;
    setOriginalUri(originalUri: string): void;
    getOriginalUri(): string;
    removeOriginalUri(): void;
    isLoginRedirect(): boolean;
    handleLoginRedirect(tokens?: Tokens): Promise<void>;
    isPKCE(): boolean;
    hasResponseType(responseType: string): boolean;
    isAuthorizationCodeFlow(): boolean;
    getIssuerOrigin(): string;
    forgotPassword(opts: any): Promise<AuthTransaction>;
    unlockAccount(opts: ForgotPasswordOptions): Promise<AuthTransaction>;
    verifyRecoveryToken(opts: VerifyRecoveryTokenOptions): Promise<AuthTransaction>;
}
export default OktaAuth;
