import { AuthTransaction } from '../tx';
import { IdxTransactionMeta } from '../types/Transaction';

export interface IdxApi {
  authenticate: (options: AuthorizeOptions) => Promise<AuthTransaction>;
  registration: (options: any) => Promise<AuthTransaction>; // TODO: use RegistrationOptions
  interact: (options?: InteractOptions) => Promise<InteractResponse>;
  introspect: (options?: IntrospectOptions) => Promise<any>; // TODO: add type
  cancel: (options?: CancelOptions) => Promise<any>; // TODO: add type
}

// Values used to resolve remediations
export interface RemediationValues {
  credentials?: {
    passcode?: string;
  };

  // Needed for V1 compatability
  username?: string;
  password?: string;

  firstName?: string;
  lastName?: string;
  email?: string;
  authenticators?: [string];
  emailVerificationCode?: string;
}

// A map from IDX data values (server spec) to RemediationValues (client spec)
export type IdxToRemediationValueMap = Record<string, string[] | string | boolean>;

export interface Remediator {
  canRemediate: () => boolean;
  getData: () => unknown;
}

export enum RemediatorFlow {
  Authenticate,
  Registration
}

export interface SupportsCodeFlow {
  useInteractionCodeFlow?: boolean;
}

export interface AcceptsInteractionHandle {
  interactionHandle?: string;
}

export interface IntrospectOptions extends AcceptsInteractionHandle {
  stateHandle?: string;
}

export interface CancelOptions extends IntrospectOptions {}

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


export interface AuthorizeOptions extends
  RemediationValues,
  InteractOptions,
  SupportsCodeFlow,
  AcceptsInteractionHandle {
}

// export interface RegistrationOptions extends 

// TODO: remove when idx-js provides type information
export interface IdxRemeditionValue {
  name: string;
  type?: string;
  required?: boolean;
}
export interface IdxRemediation {
  name: string;
  value: IdxRemeditionValue[];
  relatesTo: any; // TODO: add type
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
}
