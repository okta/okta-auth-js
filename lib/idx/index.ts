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


import { OktaAuth } from '..';
import { httpRequest } from '../http';
import { authenticate } from './authenticate';
import { cancel } from './cancel';
import { 
  handleEmailVerifyCallback, 
  isEmailVerifyCallback, 
  parseEmailVerifyCallback, 
  isEmailVerifyCallbackError, 
} from './emailVerify';
import { interact, InteractOptions, InteractResponse } from './interact';
import { introspect, IntrospectOptions } from './introspect';
import { poll } from './poll';
import { proceed, canProceed } from './proceed';
import { register } from './register';
import { recoverPassword } from './recoverPassword';
import { handleInteractionCodeRedirect } from './handleInteractionCodeRedirect';
import { startTransaction } from './startTransaction';
import { unlockAccount } from './unlockAccount';
import { isInteractionRequired, isInteractionRequiredError } from '../oidc';
import {
  getSavedTransactionMeta,
  createTransactionMeta,
  getTransactionMeta,
  saveTransactionMeta,
  clearTransactionMeta,
  isTransactionMetaValid
} from './transactionMeta';
import {
  AuthenticationOptions, 
  RegistrationOptions as IdxRegistrationOptions,
  PasswordRecoveryOptions,
  AccountUnlockOptions,
  ProceedOptions,
  CancelOptions,
  IdxOptions,
  IdxTransaction,
  IdxTransactionMeta,
  EmailVerifyCallbackResponse,
  FlowIdentifier, 
  IdxPollOptions
} from './types';
import { IdxResponse } from './types/idx-js';
import { TransactionMetaOptions } from '../types'

export interface IdxClientInterface {
  // lowest level api
  interact: (options?: InteractOptions) => Promise<InteractResponse>;
  introspect: (options?: IntrospectOptions) => Promise<IdxResponse>;

  // flow entrypoints
  authenticate: (options?: AuthenticationOptions) => Promise<IdxTransaction>;
  register: (options?: IdxRegistrationOptions) => Promise<IdxTransaction>;
  recoverPassword: (options?: PasswordRecoveryOptions) => Promise<IdxTransaction>;
  unlockAccount: (options?: AccountUnlockOptions) => Promise<IdxTransaction>;
  poll: (options?: IdxPollOptions) => Promise<IdxTransaction>;

  // flow control
  start: (options?: IdxOptions) => Promise<IdxTransaction>;
  canProceed(options?: { state?: string }): boolean;
  proceed: (options?: ProceedOptions) => Promise<IdxTransaction>;
  cancel: (options?: CancelOptions) => Promise<IdxTransaction>;
  getFlow(): FlowIdentifier | undefined;
  setFlow(flow: FlowIdentifier): void;

  // call `start` instead of `startTransaction`. `startTransaction` will be removed in next major version (7.0)
  startTransaction: (options?: IdxOptions) => Promise<IdxTransaction>;

  // redirect callbacks
  isInteractionRequired: (hashOrSearch?: string) => boolean;
  isInteractionRequiredError: (error: Error) => boolean; 
  handleInteractionCodeRedirect: (url: string) => Promise<void>;
  isEmailVerifyCallback: (search: string) => boolean;
  parseEmailVerifyCallback: (search: string) => EmailVerifyCallbackResponse;
  handleEmailVerifyCallback: (search: string) => Promise<IdxTransaction | undefined>;
  isEmailVerifyCallbackError: (error: Error) => boolean;

  // transaction meta
  getSavedTransactionMeta: (options?: TransactionMetaOptions) => IdxTransactionMeta | undefined;
  createTransactionMeta: (options?: TransactionMetaOptions) => Promise<IdxTransactionMeta>;
  getTransactionMeta: (options?: TransactionMetaOptions) => Promise<IdxTransactionMeta>;
  saveTransactionMeta: (meta: unknown) => void;
  clearTransactionMeta: () => void;
  isTransactionMetaValid: (meta: unknown) => boolean;
}

export class IdxClient implements IdxClientInterface {
  private sdk: OktaAuth;
  private httpClient: Function;

  constructor(sdk: OktaAuth) {
    this.sdk = sdk;
    this.httpClient = httpRequest.bind(this, this.sdk);
  }

  // lowest level api
  interact (options?: InteractOptions) {
    return interact(this.sdk, options);
  }
  introspect (options?: IntrospectOptions) {
    return introspect(this.sdk, options);
  }

  // flow entrypoints
  authenticate (options?: AuthenticationOptions) {
    return authenticate(this.sdk, options);
  }
  register (options?: IdxRegistrationOptions) {
    return register(this.sdk, options);
  }
  recoverPassword (options?: PasswordRecoveryOptions) {
    return recoverPassword(this.sdk, options);
  }
  unlockAccount (options?: AccountUnlockOptions) {
    return unlockAccount(this.sdk, options);
  }
  poll (options?: IdxPollOptions) {
    return poll(this.sdk, options);
  }

  // flow control
  start (options?: IdxOptions) {
    return startTransaction(this.sdk, options);
  }
  canProceed(options?: { state?: string }) {
    return canProceed(this.sdk, options);
  }
  proceed (options?: ProceedOptions) {
    return proceed(this.sdk, options);
  }
  cancel (options?: CancelOptions) {
    return cancel(this.sdk, options);
  }
  getFlow () {
    return this.sdk.options.flow;
  }
  setFlow (flow: FlowIdentifier) {
    this.sdk.options.flow = flow;
  }

  // call `start` instead of `startTransaction`. `startTransaction` will be removed in next major version (7.0)
  startTransaction (options?: IdxOptions) { return this.start(options); }

  // redirect callbacks
  isInteractionRequired (hashOrSearch?: string) {
    return isInteractionRequired(this.sdk, hashOrSearch);
  }
  isInteractionRequiredError (error: Error) {
    return isInteractionRequiredError(error);
  }
  handleInteractionCodeRedirect (url: string) {
    return handleInteractionCodeRedirect(this.sdk, url);
  }

  // email verify callbacks
  isEmailVerifyCallback (search: string) {
    return isEmailVerifyCallback(search);
  }
  parseEmailVerifyCallback (search: string) {
    return parseEmailVerifyCallback(search);
  }
  handleEmailVerifyCallback (search: string) {
    return handleEmailVerifyCallback(this.sdk, search);
  }
  isEmailVerifyCallbackError (error: Error) {
    return isEmailVerifyCallbackError(error);
  }

  // transaction meta
  getSavedTransactionMeta (options?: TransactionMetaOptions) {
    return getSavedTransactionMeta(this.sdk, options);
  }
  createTransactionMeta (options?: TransactionMetaOptions) {
    return createTransactionMeta(this.sdk, options);
  }
  getTransactionMeta (options?: TransactionMetaOptions) {
    return getTransactionMeta(this.sdk, options);
  }
  saveTransactionMeta (meta: unknown) {
    return saveTransactionMeta(this.sdk, meta);
  }
  clearTransactionMeta () {
    return clearTransactionMeta(this.sdk);
  }
  isTransactionMetaValid (meta: unknown) {
    return isTransactionMetaValid(meta);
  }
}