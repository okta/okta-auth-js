import { RequestData, RequestOptions } from '../types/http';

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
