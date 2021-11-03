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
import { addStateToken } from './util';
import { AuthTransaction } from './AuthTransaction';

function transactionStatus(sdk, args) {
  args = addStateToken(sdk, args);
  return post(sdk, sdk.getIssuerOrigin() + '/api/v1/authn', args, { withCredentials: true });
}

function resumeTransaction(sdk, args) {
  if (!args || !args.stateToken) {
    var stateToken = sdk.tx.exists._get(STATE_TOKEN_KEY_NAME);
    if (stateToken) {
      args = {
        stateToken: stateToken
      };
    } else {
      return Promise.reject(new AuthSdkError('No transaction to resume'));
    }
  }
  return sdk.tx.status(args)
    .then(function(res) {
      return new AuthTransaction(sdk, res);
    });
}

function introspect (sdk, args) {
  if (!args || !args.stateToken) {
    var stateToken = sdk.tx.exists._get(STATE_TOKEN_KEY_NAME);
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
      return new AuthTransaction(sdk, res);
    });
}

function transactionStep(sdk, args) {
  args = addStateToken(sdk, args);
  // v1 pipeline introspect API
  return post(sdk, sdk.getIssuerOrigin() + '/api/v1/authn/introspect', args, { withCredentials: true });
}

function transactionExists(sdk) {
  // We have a cookie state token
  return !!sdk.tx.exists._get(STATE_TOKEN_KEY_NAME);
}

function postToTransaction(sdk, url, args, options?) {
  options = Object.assign({ withCredentials: true }, options);
  return post(sdk, url, args, options)
    .then(function(res) {
      return new AuthTransaction(sdk, res);
    });
}

export {
  transactionStatus,
  resumeTransaction,
  transactionExists,
  postToTransaction,
  introspect,
};
