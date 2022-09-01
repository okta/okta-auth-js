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
 *
 */

/* eslint-disable complexity, max-statements */
import { post } from '../http';
import AuthSdkError from '../errors/AuthSdkError';
import { STATE_TOKEN_KEY_NAME } from '../constants';
import { OktaAuthHttpInterface } from '../http/types';
import { OktaAuthStorageOptions } from '../storage/types';
import { addStateToken } from './util/stateToken';
import { AuthnTransactionAPI } from './types';
import { OktaAuthBaseInterface } from '../base/types';

export function transactionStatus(sdk: OktaAuthHttpInterface, args) {
  args = addStateToken(sdk, args);
  return post(sdk, sdk.getIssuerOrigin() + '/api/v1/authn', args, { withCredentials: true });
}

export function resumeTransaction(sdk: OktaAuthHttpInterface, tx: AuthnTransactionAPI, args) {
  if (!args || !args.stateToken) {
    var stateToken = getSavedStateToken(sdk);
    if (stateToken) {
      args = {
        stateToken: stateToken
      };
    } else {
      return Promise.reject(new AuthSdkError('No transaction to resume'));
    }
  }
  return transactionStatus(sdk, args)
    .then(function(res) {
      return tx.createTransaction(res);
    });
}

export function introspectAuthn (sdk: OktaAuthHttpInterface, tx: AuthnTransactionAPI, args) {
  if (!args || !args.stateToken) {
    var stateToken = getSavedStateToken(sdk);
    if (stateToken) {
      args = {
        stateToken: stateToken
      };
    } else {
      return Promise.reject(new AuthSdkError('No transaction to evaluate'));
    }
  }
  return transactionStep(sdk, args)
    .then(function (res) {
      return tx.createTransaction(res);
    });
}

export function transactionStep(sdk: OktaAuthHttpInterface, args) {
  args = addStateToken(sdk, args);
  // v1 pipeline introspect API
  return post(sdk, sdk.getIssuerOrigin() + '/api/v1/authn/introspect', args, { withCredentials: true });
}

export function transactionExists(sdk: OktaAuthBaseInterface<OktaAuthStorageOptions>) {
  // We have a cookie state token
  return !!getSavedStateToken(sdk);
}

export function postToTransaction(sdk: OktaAuthHttpInterface, tx: AuthnTransactionAPI, url: string, args, options?) {
  options = Object.assign({ withCredentials: true }, options);
  return post(sdk, url, args, options)
    .then(function(res) {
      return tx.createTransaction(res);
    });
}

export function getSavedStateToken(sdk: OktaAuthBaseInterface<OktaAuthStorageOptions>) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const storage = sdk.options.storageUtil!.storage;
    return storage.get(STATE_TOKEN_KEY_NAME);
}
