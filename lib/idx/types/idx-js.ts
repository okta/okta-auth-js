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

import { Input } from './api';


// TODO: remove when idx-js provides type information

export interface ChallengeData {
  challenge: string; 
  userVerification: string; 
  extensions?: {
    appid: string;
  };
}
export interface ActivationData {
  challenge: string;
  rp: {
    name: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: {
    type: string;
    alg: number;
  }[];
  attestation?: string;
  authenticatorSelection?: {
    userVerification?: string;
    authenticatorAttachment?: string;
    requireResidentKey?: boolean;
    residentKey?: string;
  };
  excludeCredentials?: {
    id: string;
    type: string;
  }[];
}
export interface IdxAuthenticatorMethod {
  type: string;
}
export interface IdxAuthenticator {
  displayName: string;
  id: string;
  key: string;
  methods: IdxAuthenticatorMethod[];
  type: string;
  settings?: {
    complexity?: unknown;
    age?: unknown;
  };
  contextualData?: {
    enrolledQuestion?: {
      question: string;
      questionKey: string;
    };
    qrcode?: { 
      href: string; 
      method: string; 
      type: string; 
    };
    sharedSecret?: string;
    questions?: {
      questionKey: string;
      question: string;
    }[];
    questionKeys?: string[];
    selectedChannel?: string;
    activationData?: ActivationData;
    challengeData?: ChallengeData;
  };
  credentialId?: string;
  enrollmentId?: string;
  profile?: Record<string, unknown>;
  resend?: Record<string, unknown>;
  poll?: Record<string, unknown>;
  recover?: Record<string, unknown>;
  deviceKnown?: boolean;
  nickname?: string;
}

export interface IdxForm {
  value: IdxRemediationValue[];
}

export interface IdxOption {
  value: string | {form: IdxForm} | Input[];
  label: string;
  relatesTo?: IdxAuthenticator;
}

export interface IdpConfig {
  id: string;
  name: string;
}

export interface IdxRemediationValueForm {
  form: IdxForm;
}

export interface IdxRemediationValue {
  name: string;
  type?: string;
  required?: boolean;
  secret?: boolean;
  visible?: boolean;
  mutable?: boolean;
  value?: string | IdxRemediationValueForm;
  label?: string;
  form?: IdxForm;
  options?: IdxOption[];
  messages?: IdxMessages;
  minLength?: number;
  maxLength?: number;
  relatesTo?: {
    type?: string;
    value: IdxAuthenticator;
  };
}

export interface IdxRemediation {
  name: string;
  label?: string;
  value?: IdxRemediationValue[];
  relatesTo?: {
    type?: string;
    value: IdxAuthenticator;
  };
  idp?: IdpConfig;
  href?: string;
  method?: string;
  type?: string;
  accepts?: string;
  produces?: string;
  refresh?: number;
  rel?: string[];
  action?: (payload?: IdxActionParams) => Promise<IdxResponse>;
}

export interface IdxContext {
  version: string;
  stateHandle: string;
  expiresAt: string;
  intent: string;
  currentAuthenticator: {
    type: string;
    value: IdxAuthenticator;
  };
  currentAuthenticatorEnrollment: {
    type: string;
    value: IdxAuthenticator;
  };
  authenticators: {
    type: string;
    value: IdxAuthenticator[];
  };
  authenticatorEnrollments: {
    type: string;
    value: IdxAuthenticator[];
  };
  enrollmentAuthenticator: {
    type: string;
    value: IdxAuthenticator;
  };
  user?: {
    type: string;
    value: Record<string, unknown>;
  };
  uiDisplay?: IdxContextUIDisplay
  app: {
    type: string;
    value: Record<string, unknown>;
  };
  messages?: IdxMessages;
  success?: IdxRemediation;
  failure?: IdxRemediation;
}

export interface IdxContextUIDisplay {
  type: string;
  value: {
    label?: string;
    buttonLabel?: string;
  }
}

export interface IdxMessage {
  message: string;
  class: string;
  i18n: {
    key: string;
    params?: unknown[];
  };
}

export interface IdxMessages {
  type: 'array';
  value: IdxMessage[];
}

// JSON response from the server
export interface RawIdxResponse {
  version: string;
  stateHandle: string;
  intent?: string;
  expiresAt?: string;
  remediation?: {
    type: 'array';
    value: IdxRemediation[];
  };
  messages?: IdxMessages;
  success?: boolean;
  successWithInteractionCode?: IdxRemediation;
  currentAuthenticator?: {
    type: string;
    value: IdxAuthenticator;
  };
  currentAuthenticatorEnrollment?: {
    type: string;
    value: IdxAuthenticator;
  };
}

export function isRawIdxResponse(obj: any): obj is RawIdxResponse {
  return obj && obj.version;
}

export interface IdxActionParams {
  [key: string]: string | boolean | number | object;
}

export interface IdxActions {
  [key: string]: (params?: IdxActionParams) => Promise<IdxResponse>;
}

export interface IdxToPersist {
  interactionHandle?: string;
  withCredentials?: boolean;
}

export interface IdxActionFunction {
  (params: IdxActionParams): Promise<IdxResponse>;
  neededParams?: Array<Array<IdxRemediationValue>>;
}

export interface IdxResponse {
  proceed: (remediationName: string, params: unknown) => Promise<IdxResponse>;
  neededToProceed: IdxRemediation[];
  rawIdxState: RawIdxResponse;
  interactionCode?: string;
  actions: IdxActions;
  toPersist: IdxToPersist;
  context?: IdxContext;
  requestDidSucceed?: boolean;
  stepUp?: boolean;
}

export function isIdxResponse(obj: any): obj is IdxResponse {
  return obj && isRawIdxResponse(obj.rawIdxState);
}
