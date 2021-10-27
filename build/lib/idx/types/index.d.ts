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
import { IdxMessage, IdxOption } from './idx-js';
export { IdxMessage } from './idx-js';
export { AuthenticationOptions } from '../authenticate';
export { RegistrationOptions } from '../register';
export { PasswordRecoveryOptions } from '../recoverPassword';
export { CancelOptions } from '../cancel';
export declare enum IdxStatus {
    SUCCESS = 0,
    PENDING = 1,
    FAILURE = 2,
    TERMINAL = 3,
    CANCELED = 4
}
declare type Input = {
    name: string;
    required?: boolean;
};
export declare type NextStep = {
    name: string;
    type?: string;
    canSkip?: boolean;
    canResend?: boolean;
    inputs?: Input[];
    options?: IdxOption[];
};
export declare enum IdxFeature {
    PASSWORD_RECOVERY = 0,
    REGISTRATION = 1,
    SOCIAL_IDP = 2
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
}
export declare type IdxOptions = InteractOptions;
export declare type Authenticator = {
    type: string;
    methodType?: string;
    phoneNumber?: string;
};
