// Values used to resolve remediations
export interface RemediationValues {
  credentials?: {
    passcode?: string;
  };

  // Needed for V1 compatability
  username?: string;
  password?: string;
}

// A map from IDX data values (server spec) to RemediationValues (client spec)
export type IdxToRemediationValueMap = Record<string, string[] | string | boolean>;

export interface Remediator {
  canRemediate: () => boolean;
  getData: () => unknown;
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

export interface InteractOptions extends AcceptsInteractionHandle {
  state?: string;
  scopes?: string[];
}

export interface InteractResponse {
  state?: string;
  stateHandle?: string;
  interactionHandle?: string;
}


export interface AuthorizeOptions extends
  RemediationValues,
  InteractOptions,
  SupportsCodeFlow,
  AcceptsInteractionHandle {
}

// TODO: remove when idx-js provides type information
export interface IdxRemeditionValue {
  name: string;
  type?: string;
  required?: boolean;
}
export interface IdxRemediation {
  name: string;
  value: IdxRemeditionValue[];
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
