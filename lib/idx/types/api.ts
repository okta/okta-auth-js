import { APIError } from '../../types/api';
import { Tokens } from '../../types/Token';
import { PKCETransactionMeta } from '../../types/Transaction';
import { FlowIdentifier } from './FlowIdentifier';
import {
  IdxActions,
  IdxAuthenticator,
  IdxContext,
  IdxForm,
  IdxMessage,
  IdxOption,
  IdxRemediation,
  IdxResponse,
  RawIdxResponse,
  IdxActionParams,
  IdpConfig,
} from './idx-js';

export enum IdxStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILURE = 'FAILURE',
  TERMINAL = 'TERMINAL',
  CANCELED = 'CANCELED',
}

export enum AuthenticatorKey {
  OKTA_PASSWORD = 'okta_password',
  OKTA_EMAIL = 'okta_email',
  PHONE_NUMBER = 'phone_number',
  GOOGLE_AUTHENTICATOR = 'google_otp',
  SECURITY_QUESTION = 'security_question',
  OKTA_VERIFY = 'okta_verify',
  WEBAUTHN = 'webauthn',
}

export type Input = {
  name: string;
  key?: string;
  type?: string;
  label?: string;
  value?: string | {form: IdxForm} | Input[];
  minLength?: number;
  maxLength?: number;
  secret?: boolean;
  required?: boolean;
  options?: IdxOption[];
  relatesTo?: IdxAuthenticator;
  mutable?: boolean;
  visible?: boolean;
}


export interface IdxPollOptions {
  required?: boolean;
  refresh?: number;
}

export type NextStep = {
  name: string;
  authenticator?: IdxAuthenticator;
  canSkip?: boolean;
  canResend?: boolean;
  inputs?: Input[];
  options?: IdxOption[];
  poll?: IdxPollOptions;
  authenticatorEnrollments?: IdxAuthenticator[];
  // eslint-disable-next-line no-use-before-define
  action?: (params?: IdxActionParams) => Promise<IdxTransaction>;
  idp?: IdpConfig;
  href?: string;
}

export enum IdxFeature {
  PASSWORD_RECOVERY = 'recover-password',
  REGISTRATION = 'enroll-profile',
  SOCIAL_IDP = 'redirect-idp',
  ACCOUNT_UNLOCK = 'unlock-account',
}

export interface IdxTransactionMeta extends PKCETransactionMeta {
  interactionHandle?: string;
  remediations?: string[];
  flow?: FlowIdentifier;
  withCredentials?: boolean;
  activationToken?: string;
  recoveryToken?: string;
  maxAge?: string | number;
  useGenericRemediator?: boolean;
}

export interface IdxTransaction {
  status: IdxStatus;
  tokens?: Tokens;
  nextStep?: NextStep;
  messages?: IdxMessage[];
  error?: APIError | IdxResponse;
  meta?: IdxTransactionMeta;
  enabledFeatures?: IdxFeature[];
  availableSteps?: NextStep[];
  requestDidSucceed?: boolean;

  // from idx-js, used by signin widget
  proceed: (remediationName: string, params: unknown) => Promise<IdxResponse>;
  neededToProceed: IdxRemediation[];
  rawIdxState: RawIdxResponse;
  interactionCode?: string;
  actions: IdxActions;
  context: IdxContext;
}


export type Authenticator = {
  id?: string;
  key?: string;
  methodType?: string;
  phoneNumber?: string;
};

export function isAuthenticator(obj: any): obj is Authenticator {
  return obj && (obj.key || obj.id);
}

export interface RemediationResponse {
  idxResponse: IdxResponse;
  nextStep?: NextStep;
  messages?: IdxMessage[];
  terminal?: boolean;
  canceled?: boolean;
}

export interface InteractResponse {
  state?: string;
  interactionHandle: string;
  meta: IdxTransactionMeta;
}
