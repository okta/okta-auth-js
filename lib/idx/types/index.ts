import { InteractOptions } from '../interact';
import { APIError, Tokens } from '../../types';
import { IdxTransactionMeta } from '../../types/Transaction';
import { IdxMessage, IdxOption } from './idx-js';

export { IdxMessage } from './idx-js';
export { AuthenticationOptions } from '../authenticate';
export { RegistrationOptions } from '../register';
export { PasswordRecoveryOptions } from '../recoverPassword';
export { CancelOptions } from '../cancel';

export enum IdxStatus {
  SUCCESS,
  PENDING,
  FAILURE,
  TERMINAL,
  CANCELED,
}

type Input = {
  name: string;
  required?: boolean;
}

export type NextStep = {
  name: string;
  type?: string;
  canSkip?: boolean;
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
}

export type IdxOptions = InteractOptions;

export type Authenticator = {
  type: string;
  methodType?: string;
  phoneNumber?: string;
};
