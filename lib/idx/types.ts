import { IdxTransactionMeta } from '../types/Transaction';
import { Base as Remeditor } from './remediators';

export { RemediationValues } from './remediators';
export { AuthenticationOptions } from './authenticate';
export { RegistrationOptions } from './register';
export { PasswordRecoveryOptions } from './recoverPassword';
export { CancelOptions } from './cancel';

export type RemediationFlow = Record<string, typeof Remeditor>;

// A map from IDX data values (server spec) to RemediationValues (client spec)
export type IdxToRemediationValueMap = Record<string, string[] | string | boolean>;

export type NextStep = {
  name: string;
  type?: string;
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

export interface IdxOptions extends
  InteractOptions,
  AcceptsInteractionHandle {
}

export enum IdxStatus {
  SUCCESS,
  PENDING,
  FAILED,
}

// TODO: remove when idx-js provides type information
export interface IdxRemeditionValue {
  name: string;
  type?: string;
  required?: boolean;
  value?: string;
  form?: {
    value: IdxRemeditionValue[];
  };
  options?: IdxRemediation[];
}
export interface IdxRemediation {
  name: string;
  label?: string;
  value: IdxRemeditionValue[];
  relatesTo: {
    type: string;
    value: {
      type: string;
    };
  };
}

export interface IdxMessage {
  message: string;
  class: string;
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
