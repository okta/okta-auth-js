import { IdxTransactionMeta } from '../types/Transaction';
import { Base as Remediator } from './remediators';
import { APIError, Tokens } from '../types';

export { RemediationValues } from './remediators';
export { AuthenticationOptions } from './authenticate';
export { RegistrationOptions } from './register';
export { PasswordRecoveryOptions } from './recoverPassword';
export { CancelOptions } from './cancel';

export type RemediationFlow = Record<string, typeof Remediator>;

// A map from IDX data values (server spec) to RemediationValues (client spec)
export type IdxToRemediationValueMap = Record<string, string[] | string | boolean>;

export enum IdxStatus {
  SUCCESS,
  PENDING,
  FAILURE,
  TERMINAL,
}

export type NextStep = {
  name: string;
  type?: string;
  canSkip?: boolean;
}

export interface IdxTransaction {
  status: IdxStatus;
  tokens?: Tokens;
  nextStep?: NextStep;
  messages?: IdxMessage[];
  error?: APIError;
  meta?: IdxTransactionMeta;
}

export interface AcceptsInteractionHandle {
  interactionHandle?: string;
}

export interface IntrospectOptions extends AcceptsInteractionHandle {
  stateHandle?: string;
}

export interface InteractOptions extends AcceptsInteractionHandle {
  state?: string;
  scopes?: string[];
}

export interface InteractResponse {
  state?: string;
  stateHandle?: string;
  interactionHandle?: string;
  idxResponse?: IdxResponse;
  meta?: IdxTransactionMeta;
}

export type IdxOptions = InteractOptions;

export interface IdpConfig {
  id: string;
  name: string;
}

// TODO: remove when idx-js provides type information
export interface IdxAuthenticatorMethod {
  type: string;
}
export interface IdxAuthenticator {
  displayName: string;
  id: string;
  key: string;
  methods: IdxAuthenticatorMethod[];
  type: string;
}

export interface IdxFormOption {
  value: string;
  label: string;
}
export interface IdxRemediationValue {
  name: string;
  type?: string;
  required?: boolean;
  secret?: boolean;
  value?: string;
  label?: string;
  form?: {
    value: IdxRemediationValue[];
  };
  options?: (IdxRemediation | IdxFormOption)[];
}
export interface IdxRemediation {
  name: string;
  label?: string;
  value: IdxRemediationValue[];
  relatesTo?: {
    type?: string;
    value: IdxAuthenticator;
  };
  idp?: IdpConfig;
  href?: string;
  method?: string;
  type?: string;
}

export interface IdxMessage {
  message: string;
  class: string;
  i18n: {
    key: string;
  };
}

export interface IdxMessages {
  type: string; // "array"
  value: IdxMessage[];
}

// JSON response from the server
export interface RawIdxResponse {
  version: string;
  stateHandle: string;
  remediation?: IdxRemediation[];
  messages?: IdxMessages;
}

export function isRawIdxResponse(obj: any): obj is RawIdxResponse {
  return obj && obj.version;
}

// Object returned from idx-js
export interface IdxResponse {
  proceed: (remediationName: string, params: unknown) => Promise<IdxResponse>;
  neededToProceed: IdxRemediation[];
  rawIdxState: RawIdxResponse;
  interactionCode?: string;
  actions: Record<string, Function>;
  toPersist: {
    interactionHandle?: string;
  };
}
