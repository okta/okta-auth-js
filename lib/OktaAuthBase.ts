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
import { assertValidConfig } from './builderUtil';
import { removeTrailingSlash } from './util';
import {
  transactionStatus,
  resumeTransaction,
  transactionExists,
  introspect,
  postToTransaction,
  AuthTransaction
} from './tx';
import {
  OktaAuth,
  OktaAuthOptions,
  SignInWithCredentialsOptions,
  SigninWithRedirectOptions,
  ForgotPasswordOptions,
  VerifyRecoveryTokenOptions,
  TransactionAPI,
  SessionAPI,
  SigninAPI
} from './types';

export default class OktaAuthBase implements OktaAuth, SigninAPI {
  options: OktaAuthOptions;
  tx: TransactionAPI;
  userAgent: string;
  session: SessionAPI;

  constructor(args: OktaAuthOptions) {
    assertValidConfig(args);
    this.options = {
      issuer: removeTrailingSlash(args.issuer),
      httpRequestClient: args.httpRequestClient,
      storageUtil: args.storageUtil,
      headers: args.headers,
      devMode: args.devMode || false
    };

    this.tx = {
      status: transactionStatus.bind(null, this),
      resume: resumeTransaction.bind(null, this),
      exists: Object.assign(transactionExists.bind(null, this), {
        _get: (name) => {
          const storage = this.options.storageUtil.storage;
          return storage.get(name);
        }
      }),
      introspect: introspect.bind(null, this)
    };
    
  }

  // { username, password, (relayState), (context) }
  signIn(opts: SignInWithCredentialsOptions | SigninWithRedirectOptions): Promise<AuthTransaction> | Promise<void> {
    return postToTransaction(this, '/api/v1/authn', opts);
  }

  getIssuerOrigin(): string {
    // Infer the URL from the issuer URL, omitting the /oauth2/{authServerId}
    return this.options.issuer.split('/oauth2/')[0];
  }

  // { username, (relayState) }
  forgotPassword(opts): Promise<AuthTransaction> {
    return postToTransaction(this, '/api/v1/authn/recovery/password', opts);
  }

  // { username, (relayState) }
  unlockAccount(opts: ForgotPasswordOptions): Promise<AuthTransaction> {
    return postToTransaction(this, '/api/v1/authn/recovery/unlock', opts);
  }

  // { recoveryToken }
  verifyRecoveryToken(opts: VerifyRecoveryTokenOptions): Promise<AuthTransaction> {
    return postToTransaction(this, '/api/v1/authn/recovery/token', opts);
  }

}
