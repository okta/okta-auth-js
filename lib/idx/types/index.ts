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


import { InteractOptions } from '../interact';
import { IntrospectOptions } from '../introspect';
import { APIError, Tokens } from '../../types';
import { PKCETransactionMeta } from '../../types/Transaction';
import { 
  IdxActions, 
  IdxAuthenticator, 
  IdxContext,
  IdxForm,
  IdxMessage, 
  IdxOption, 
  IdxRemediation, 
  IdxResponse, 
  RawIdxResponse 
} from './idx-js';
import { FlowIdentifier } from './FlowIdentifier';

export { IdxMessage, ChallengeData, ActivationData } from './idx-js';
export { AuthenticationOptions } from '../authenticate';
export { RegistrationOptions } from '../register';
export { PasswordRecoveryOptions } from '../recoverPassword';
export { AccountUnlockOptions } from '../unlockAccount';
export { ProceedOptions } from '../proceed';
export { CancelOptions } from '../cancel';
export { FlowIdentifier };
export { IdxAuthenticator };
export { EmailVerifyCallbackResponse } from '../emailVerify';
export { WebauthnEnrollValues } from '../authenticator/WebauthnEnrollment';
export { WebauthnVerificationValues } from '../authenticator/WebauthnVerification';

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
  type?: string;
  label?: string;
  value?: string | {form: IdxForm};
  minLength?: number;
  maxLength?: number;
  secret?: boolean;
  required?: boolean;
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

  // from idx-js, used by signin widget
  proceed: (remediationName: string, params: unknown) => Promise<IdxResponse>;
  neededToProceed: IdxRemediation[];
  rawIdxState: RawIdxResponse;
  interactionCode?: string;
  actions: IdxActions;
  context: IdxContext;
}

export type IdxOptions = InteractOptions & IntrospectOptions & {
  flow?: FlowIdentifier;
  exchangeCodeForTokens?: boolean;
  autoRemediate?: boolean;
};

export interface IdxPollOptions {
  required?: boolean;
  refresh?: number;
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
