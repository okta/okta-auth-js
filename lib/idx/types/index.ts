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
import { APIError, Tokens } from '../../types';
import { IdxTransactionMeta } from '../../types/Transaction';
import { IdxAuthenticator, IdxMessage, IdxOption, IdxResponse } from './idx-js';

export { IdxMessage } from './idx-js';
export { AuthenticationOptions } from '../authenticate';
export { RegistrationOptions } from '../register';
export { PasswordRecoveryOptions } from '../recoverPassword';
export { CancelOptions } from '../cancel';

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
  OKTA_VERIFIER = 'okta_verifier',
  PHONE_NUMBER = 'phone_number',
  GOOGLE_AUTHENTICATOR = 'google_otp',
}

export type Input = {
  name: string;
  label?: string;
  value?: string;
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
}

export enum IdxFeature {
  PASSWORD_RECOVERY,
  REGISTRATION,
  SOCIAL_IDP,
}

export interface IdxTransaction {
  status: IdxStatus;
  tokens?: Tokens;
  nextStep?: NextStep;
  messages?: IdxMessage[];
  error?: APIError;
  meta?: IdxTransactionMeta;
  enabledFeatures?: IdxFeature[];
  availableSteps?: NextStep[];
  _idxResponse?: IdxResponse; // Temporary for widget conversion. Will not be supported long-term. OKTA-418165
}

export type IdxOptions = InteractOptions;

export type Authenticator = {
  key: string;
  methodType?: string;
  phoneNumber?: string;
};
