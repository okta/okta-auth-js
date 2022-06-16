/* eslint-disable no-use-before-define */
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

import { AuthnTransaction, AuthnTransactionAPI } from '../tx/types';
import { Token, Tokens, RevocableToken, AccessToken, IDToken, RefreshToken } from './Token';
import { JWTObject } from './JWT';
import { CustomUserClaims, UserClaims } from './UserClaims';
import { CustomUrls, OktaAuthOptions, TokenParams } from './OktaAuthOptions';
import { StorageManager } from '../StorageManager';
import TransactionManager from '../TransactionManager';
import { TokenManagerInterface } from './TokenManager';
import { ServiceManagerInterface } from './Service';
import { OktaUserAgent } from '../OktaUserAgent';
import { 
  AuthenticationOptions, 
  RegistrationOptions as IdxRegistrationOptions,
  PasswordRecoveryOptions,
  AccountUnlockOptions,
  ProceedOptions,
  CancelOptions,
  IdxTransaction,
  IdxTransactionMeta,
  EmailVerifyCallbackResponse,
  IdxAuthenticator,
  ChallengeData,
  ActivationData,
  WebauthnEnrollValues,
  WebauthnVerificationValues,
  FlowIdentifier, 
  IdxPollOptions,
  IdxResponse,
  IntrospectOptions,
  InteractOptions,
  InteractResponse,
  StartOptions
} from '../idx/types';
import { TransactionMetaOptions } from './Transaction';
import { IdxToPersist, RawIdxResponse } from '../idx/types/idx-js';

export interface OktaAuthOptionsInterface {
  options: OktaAuthOptions;
  getIssuerOrigin(): string;
}

export interface OktaAuthStorageInterface {
  storageManager: StorageManager;

}
export interface OktaAuthHttpInterface extends 
  OktaAuthOptionsInterface,
  OktaAuthStorageInterface
{
  _oktaUserAgent: OktaUserAgent;
}

export interface OktaAuthFeaturesInterface {
  // Functional on browser only
  features: FeaturesAPI;
}

export interface OktaAuthTransactionInterface {
  transactionManager: TransactionManager;
}

export interface OktaAuthOIDCInterface extends
  OktaAuthOptionsInterface,
  OktaAuthHttpInterface,
  OktaAuthFeaturesInterface,
  OktaAuthTransactionInterface
{
  token: TokenAPI;
  tokenManager: TokenManagerInterface;
}

export interface OktaAuthIdxInterface extends
  OktaAuthHttpInterface,
  OktaAuthTransactionInterface,
  Pick<OktaAuthOIDCInterface, 'token'>
{
  idx: IdxAPI;
}

export interface OktaAuthTxInterface extends
  OktaAuthHttpInterface
{
  tx: AuthnTransactionAPI;
}

export interface OktaAuthInterface extends
  OktaAuthOptionsInterface,
  OktaAuthStorageInterface,
  OktaAuthFeaturesInterface,
  OktaAuthHttpInterface,
  OktaAuthTransactionInterface,
  OktaAuthTxInterface,
  OktaAuthIdxInterface,
  OktaAuthOIDCInterface
{
  getOriginalUri(): string | undefined;
  
  
  serviceManager: ServiceManagerInterface;
}

export interface FieldError {
  errorSummary: string;
  reason?: string;
  location?: string;
  locationType?: string;
  domain?: string;
}

export interface APIError {
  errorSummary: string;
  errorCode?: string;
  errorLink?: string;
  errorId?: string;
  errorCauses?: Array<FieldError>;
}

// HTTP API
export interface HttpAPI {
  setRequestHeader(name: string, value: string): void;
}


// Fingerprint
export interface FingerprintOptions {
  timeout?: number;
}

export type FingerprintAPI = (options?: FingerprintOptions) => Promise<string>;

// Session API
export interface SessionObject {
  status: string;
  refresh?: () => Promise<object>;
  user?: () => Promise<object>;
}

export interface SessionAPI {
  close: () => Promise<object>;
  exists: () => Promise<boolean>;
  get: () => Promise<SessionObject>;
  refresh: () => Promise<object>;
  setCookieAndRedirect: (sessionToken?: string, redirectUri?: string) => void;
}

export interface PopupParams {
  popupTitle?: string;
  popupWindow?: Window;
}

export interface TokenResponse {
  tokens: Tokens;
  state: string;
  code?: string;
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

export interface GetWithRedirectAPI extends GetWithRedirectFunction {
  _setLocation: SetLocationFunction;
}

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
  getWithRedirect: GetWithRedirectAPI;
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
  isIE11OrLess(): boolean;
}

export interface CryptoAPI {
  base64UrlToBuffer(b64u: string): Uint8Array;
  bufferToBase64Url(bin: Uint8Array): string;
}

export interface WebauthnAPI {
  getAssertion(credential: PublicKeyCredential): WebauthnVerificationValues;
  getAttestation(credential: PublicKeyCredential): WebauthnEnrollValues;
  buildCredentialRequestOptions(
    challengeData: ChallengeData, authenticatorEnrollments: IdxAuthenticator[]
  ): CredentialRequestOptions;
  buildCredentialCreationOptions(
    activationData: ActivationData, authenticatorEnrollments: IdxAuthenticator[]
  ): CredentialCreationOptions;
}

export interface SupportsCodeFlow {
  useInteractionCodeFlow?: boolean;
}

export interface SigninOptions extends 
  SupportsCodeFlow,
  AuthenticationOptions {
    // Only used in Authn V1
    relayState?: string;
    context?: {
      deviceToken?: string;
    };
    sendFingerprint?: boolean;
    stateToken?: string;
}

export interface SigninWithRedirectOptions extends SigninOptions, TokenParams {
  originalUri?: string;
}

export interface SigninWithCredentialsOptions extends SigninOptions {
  username?: string;
  password?: string;
}

export interface SigninAPI {
  signIn(opts: SigninOptions): Promise<AuthnTransaction>;
  signInWithCredentials(opts: SigninWithCredentialsOptions): Promise<AuthnTransaction>;
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

export interface SignoutAPI {
  signOut(opts: SignoutOptions);
}

export interface ForgotPasswordOptions {
  username: string;
  factorType: 'SMS' | 'EMAIL' | 'CALL';
  relayState?: string;
}

export interface VerifyRecoveryTokenOptions {
  recoveryToken: string;
}

export interface PkceAPI {
  DEFAULT_CODE_CHALLENGE_METHOD: string;
  generateVerifier(prefix: string): string;
  computeChallenge(str: string): PromiseLike<any>;
}


export interface IdxAPI {
  // lowest level api
  interact: (options?: InteractOptions) => Promise<InteractResponse>;
  introspect: (options?: IntrospectOptions) => Promise<IdxResponse>;
  makeIdxResponse: (rawIdxResponse: RawIdxResponse, toPersist: IdxToPersist, requestDidSucceed: boolean) => IdxResponse;

  // flow entrypoints
  authenticate: (options?: AuthenticationOptions) => Promise<IdxTransaction>;
  register: (options?: IdxRegistrationOptions) => Promise<IdxTransaction>;
  recoverPassword: (options?: PasswordRecoveryOptions) => Promise<IdxTransaction>;
  unlockAccount: (options?: AccountUnlockOptions) => Promise<IdxTransaction>;
  poll: (options?: IdxPollOptions) => Promise<IdxTransaction>;

  // flow control
  start: (options?: StartOptions) => Promise<IdxTransaction>;
  canProceed(options?: ProceedOptions): boolean;
  proceed: (options?: ProceedOptions) => Promise<IdxTransaction>;
  cancel: (options?: CancelOptions) => Promise<IdxTransaction>;
  getFlow(): FlowIdentifier | undefined;
  setFlow(flow: FlowIdentifier): void;

  // call `start` instead of `startTransaction`. `startTransaction` will be removed in next major version (7.0)
  startTransaction: (options?: StartOptions) => Promise<IdxTransaction>;

  // redirect callbacks
  isInteractionRequired: (hashOrSearch?: string) => boolean;
  isInteractionRequiredError: (error: Error) => boolean; 
  handleInteractionCodeRedirect: (url: string) => Promise<void>;
  isEmailVerifyCallback: (search: string) => boolean;
  parseEmailVerifyCallback: (search: string) => EmailVerifyCallbackResponse;
  handleEmailVerifyCallback: (search: string) => Promise<IdxTransaction | undefined>;
  isEmailVerifyCallbackError: (error: Error) => boolean;

  // transaction meta
  getSavedTransactionMeta: (options?: TransactionMetaOptions) => IdxTransactionMeta | undefined;
  createTransactionMeta: (options?: TransactionMetaOptions) => Promise<IdxTransactionMeta>;
  getTransactionMeta: (options?: TransactionMetaOptions) => Promise<IdxTransactionMeta>;
  saveTransactionMeta: (meta: unknown) => void;
  clearTransactionMeta: () => void;
  isTransactionMetaValid: (meta: unknown) => boolean;
}
