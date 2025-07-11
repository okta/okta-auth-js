
import { FingerprintAPI } from '../base/types';
import { StorageManagerInterface } from '../storage/types';
import { RequestData, RequestOptions, OktaAuthHttpInterface, OktaAuthHttpOptions } from '../http/types';

export interface AuthnTransactionLink {
  name?: string;
  type: string;
  href: string;
  hints?: {
    allow?: string[];
  };
}

// Authn V1 transaction
export interface AuthnTransactionState {
  status: string;
  stateToken?: string;
  type?: string;
  expiresAt?: string;
  relayState?: string;
  factorResult?: string;
  factorType?: string;
  recoveryToken?: string;
  recoveryType?: string;
  autoPush?: boolean | (() => boolean);
  rememberDevice?: boolean | (() => boolean);
  profile?: {
    updatePhone?: boolean;
  };
  _links?: Record<string, AuthnTransactionLink>;
}

// eslint-disable-next-line no-use-before-define
export type AuthnTransactionFunction = (obj?: any) => Promise<AuthnTransaction>;

export interface AuthnTransactionFunctions {
  // common
  next?: AuthnTransactionFunction;
  cancel?: AuthnTransactionFunction;
  skip?: AuthnTransactionFunction;
  // locked_out
  unlock?: AuthnTransactionFunction;
  // password
  changePassword?: AuthnTransactionFunction;
  resetPassword?: AuthnTransactionFunction;
  // recovery
  answer?: AuthnTransactionFunction;
  recovery?: AuthnTransactionFunction;
  // recovery_challenge
  verify?: AuthnTransactionFunction;
  resend?: AuthnTransactionFunction;
  // mfa_enroll_activate
  activate?: AuthnTransactionFunction;
  poll?: AuthnTransactionFunction;
  prev?: AuthnTransactionFunction;
}

export interface AuthnTransaction extends AuthnTransactionState, AuthnTransactionFunctions {
  sessionToken?: string;
  user?: Record<string, any>;
  factor?: Record<string, any>;
  factors?: Array<Record<string, any> >;
  policy?: Record<string, any>;
  scopes?: Array<Record<string, any> >;
  target?: Record<string, any>;
  authentication?: Record<string, any>;
}

// Authn (classic) api
export interface AuthnTransactionAPI {
  exists: () => boolean;
  status: (args?: object) => Promise<object>;
  resume: (args?: object) => Promise<AuthnTransaction>;
  introspect: (args?: object) => Promise<AuthnTransaction>;
  createTransaction: (res?: AuthnTransactionState) => AuthnTransaction;
  postToTransaction: (url: string, args?: RequestData, options?: RequestOptions) => Promise<AuthnTransaction>;
}

export interface SigninOptions {
  // Only used in Authn V1
  relayState?: string;
  context?: {
    deviceToken?: string;
  };
  sendFingerprint?: boolean;
  stateToken?: string;
  
  // Optional credentials
  username?: string;
  password?: string;
}

export interface SigninWithCredentialsOptions extends SigninOptions {
  // Required credentials
  username: string;
  password: string;
}

export interface SigninAPI {
  signIn(opts: SigninOptions): Promise<AuthnTransaction>;
  signInWithCredentials(opts: SigninWithCredentialsOptions): Promise<AuthnTransaction>;
}

export interface ForgotPasswordOptions {
  username: string;
  factorType: 'SMS' | 'EMAIL' | 'CALL';
  relayState?: string;
}

export interface VerifyRecoveryTokenOptions {
  recoveryToken: string;
  multiOptionalFactorEnroll?: boolean;
}

export interface AuthnAPI extends SigninAPI {
  forgotPassword(opts): Promise<AuthnTransaction>;

  // { username, (relayState) }
  unlockAccount(opts: ForgotPasswordOptions): Promise<AuthnTransaction>;

  // { recoveryToken, (multiOptionalFactorEnroll) }
  verifyRecoveryToken(opts: VerifyRecoveryTokenOptions): Promise<AuthnTransaction>;
}

export interface OktaAuthTxInterface
<
  S extends StorageManagerInterface = StorageManagerInterface,
  O extends OktaAuthHttpOptions = OktaAuthHttpOptions,
> 
  extends OktaAuthHttpInterface<S, O>, AuthnAPI
{
  tx: AuthnTransactionAPI; // legacy name
  authn: AuthnTransactionAPI; // new name
  fingerprint: FingerprintAPI;
}
