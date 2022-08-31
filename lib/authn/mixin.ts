/* eslint-disable max-statements */
/* eslint-disable complexity */
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

import { 
  clone,
} from '../util';
import fingerprint from '../browser/fingerprint';
import {
  FingerprintAPI,
  SigninWithCredentialsOptions,
  ForgotPasswordOptions,
  VerifyRecoveryTokenOptions,
  SigninOptions,
  OktaAuthTxInterface,
  AuthnTransaction,
  AuthnTransactionAPI
} from './types';
import {
  createAuthnTransactionAPI,
} from './factory';
import { StorageManagerInterface } from '../storage/types';
import { OktaAuthHttpInterface, OktaAuthHttpOptions } from '../http/types';
import { OktaAuthConstructor } from '../base/types';

export function mixinAuthn
<
  S extends StorageManagerInterface = StorageManagerInterface,
  O extends OktaAuthHttpOptions = OktaAuthHttpOptions,
  TBase extends OktaAuthConstructor<OktaAuthHttpInterface<S, O>>
    = OktaAuthConstructor<OktaAuthHttpInterface<S, O>>
>
(Base: TBase): TBase & OktaAuthConstructor<OktaAuthTxInterface<S, O>>
{
  return class OktaAuthTx extends Base implements OktaAuthTxInterface<S, O> {
    tx: AuthnTransactionAPI; // legacy, may be removed in future version
    authn: AuthnTransactionAPI;
    fingerprint: FingerprintAPI;

    constructor(...args: any[]) {
      super(...args);

      this.authn = this.tx = createAuthnTransactionAPI(this);
      
      // Fingerprint API
      this.fingerprint = fingerprint.bind(null, this);
    }

    // Authn  V1
    async signIn(opts: SigninOptions): Promise<AuthnTransaction> {
      opts = clone(opts || {});
      const _postToTransaction = (options?) => {
        delete opts.sendFingerprint;
        return this.tx.postToTransaction('/api/v1/authn', opts, options);
      };
      if (!opts.sendFingerprint) {
        return _postToTransaction();
      }
      return this.fingerprint()
      .then(function(fingerprint) {
        return _postToTransaction({
          headers: {
            'X-Device-Fingerprint': fingerprint
          }
        });
      });
    }

    // Authn  V1
    async signInWithCredentials(opts: SigninWithCredentialsOptions): Promise<AuthnTransaction> {
      return this.signIn(opts);
    }

    // { username, (relayState) }
    forgotPassword(opts): Promise<AuthnTransaction> {
      return this.tx.postToTransaction('/api/v1/authn/recovery/password', opts);
    }

    // { username, (relayState) }
    unlockAccount(opts: ForgotPasswordOptions): Promise<AuthnTransaction> {
      return this.tx.postToTransaction('/api/v1/authn/recovery/unlock', opts);
    }

    // { recoveryToken }
    verifyRecoveryToken(opts: VerifyRecoveryTokenOptions): Promise<AuthnTransaction> {
      return this.tx.postToTransaction('/api/v1/authn/recovery/token', opts);
    }

  };
}
