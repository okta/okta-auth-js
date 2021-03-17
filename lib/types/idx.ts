export interface SupportsCodeFlow {
  useInteractionCodeFlow?: boolean;
}

export interface AcceptsInteractionHandle {
  interactionHandle?: string;
}

export interface IntrospectOptions extends AcceptsInteractionHandle {
  stateHandle?: string;
}

export interface IdentifyOptions {
  // Needed for V1 compatability
  username?: string;
  password?: string;
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


export interface AuthorizeOptions extends IdentifyOptions, InteractOptions, SupportsCodeFlow, AcceptsInteractionHandle {

}

// TODO: remove when idx-js provides type information
export interface IdxRemeditionValue {
  name: string;
  type?: string;
}
export interface IdxRemediation {
  name: string;
  value: IdxRemeditionValue[];
}

export interface RawIdxResponse {
  version: string;
}

export function isRawIdxResponse(obj: any): obj is RawIdxResponse {
  return obj && obj.version;
}

export interface IdxResponse {
  proceed: (remediationName: string, params: unknown) => Promise<IdxResponse>;
  neededToProceed: IdxRemediation[];
  rawIdxResponse: RawIdxResponse;
}
