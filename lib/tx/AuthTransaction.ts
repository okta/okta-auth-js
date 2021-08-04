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

import { get } from '../http';
import { find, omit, toQueryString, clone, isObject } from '../util';
import AuthSdkError from '../errors/AuthSdkError';
import { TransactionState } from './TransactionState';
import { addStateToken } from './util';
import { getPollFn } from './poll';
import { postToTransaction } from './api';
import { IdxStatus } from '../idx/types';

interface PostToTransactionParams {
  autoPush?: boolean;
  rememberDevice?: boolean;
  updatePhone?: boolean;
}

type AuthTransactionFunction = (obj?: any) => Promise<AuthTransaction>;

interface AuthTransactionFunctions {
  // common
  next?: AuthTransactionFunction;
  cancel?: AuthTransactionFunction;
  skip?: AuthTransactionFunction;
  // locked_out
  unlock?: AuthTransactionFunction;
  // password
  changePassword?: AuthTransactionFunction;
  resetPassword?: AuthTransactionFunction;
  // recovery
  answer?: AuthTransactionFunction;
  recovery?: AuthTransactionFunction;
  // recovery_challenge
  verify?: AuthTransactionFunction;
  resend?: AuthTransactionFunction;
  // mfa_enroll_activate
  activate?: AuthTransactionFunction;
  poll?: AuthTransactionFunction;
  prev?: AuthTransactionFunction;
}

export class AuthTransaction implements TransactionState, AuthTransactionFunctions {
  next?: AuthTransactionFunction;
  cancel?: AuthTransactionFunction;
  skip?: AuthTransactionFunction;
  unlock?: AuthTransactionFunction;
  changePassword?: AuthTransactionFunction;
  resetPassword?: AuthTransactionFunction;
  answer?: AuthTransactionFunction;
  recovery?: AuthTransactionFunction;
  verify?: AuthTransactionFunction;
  resend?: AuthTransactionFunction;
  activate?: AuthTransactionFunction;
  poll?: AuthTransactionFunction;
  prev?: AuthTransactionFunction;

  data: TransactionState;
  stateToken?: string;
  sessionToken?: string;
  status: string | IdxStatus;
  user?: Record<string, any>;
  factor?: Record<string, any>;
  factors?: Array<Record<string, any> >;
  policy?: Record<string, any>;
  scopes?: Array<Record<string, any> >;
  target?: Record<string, any>;
  authentication?: Record<string, any>;
  constructor(sdk, res = null) {
    if (res) {
      this.data = res;

      if (this.data.interactionHandle) {
        this.status = res.status;
        return;
      }

      // Parse response from Authn V1
      Object.assign(this, flattenEmbedded(sdk, res, res, {}));
      delete this.stateToken;

      // RECOVERY_CHALLENGE has some responses without _links.
      // Without _links, we emulate cancel to make it intuitive
      // to return to the starting state. We may remove this
      // when OKTA-75434 is resolved
      if (res.status === 'RECOVERY_CHALLENGE' && !res._links) {
        this.cancel = function() {
          return Promise.resolve(new AuthTransaction(sdk));
        };
      }
    }
  }
}

function link2fn(sdk, res, obj, link, ref) {
  if (Array.isArray(link)) {
    return function(name, opts?) {
      if (!name) {
        throw new AuthSdkError('Must provide a link name');
      }

      var lk = find(link, {name: name});
      if (!lk) {
        throw new AuthSdkError('No link found for that name');
      }

      return link2fn(sdk, res, obj, lk, ref)(opts);
    };

  } else if (link.hints &&
      link.hints.allow &&
      link.hints.allow.length === 1) {
    var method = link.hints.allow[0];
    switch (method) {

      case 'GET':
        return function() {
          return get(sdk, link.href, { withCredentials: true });
        };

      case 'POST':
        // eslint-disable-next-line max-statements,complexity
        return function(opts: TransactionState) {
          if (ref && ref.isPolling) {
            ref.isPolling = false;
          }

          var data = addStateToken(res, opts);

          if (res.status === 'MFA_ENROLL' || res.status === 'FACTOR_ENROLL') {
            // Add factorType and provider
            Object.assign(data, {
              factorType: obj.factorType,
              provider: obj.provider
            });
          }

          var params = {} as PostToTransactionParams;
          var autoPush = data.autoPush;
          if (autoPush !== undefined) {
            if (typeof autoPush === 'function') {
              try {
                params.autoPush = !!autoPush();
              }
              catch (e) {
                return Promise.reject(new AuthSdkError('AutoPush resulted in an error.'));
              }
            }
            else if (autoPush !== null) {
              params.autoPush = !!autoPush;
            }
            data = omit(data, 'autoPush');
          }

          var rememberDevice = data.rememberDevice;
          if (rememberDevice !== undefined) {
            if (typeof rememberDevice === 'function') {
              try {
                params.rememberDevice = !!rememberDevice();
              }
              catch (e) {
                return Promise.reject(new AuthSdkError('RememberDevice resulted in an error.'));
              }
            }
            else if (rememberDevice !== null) {
              params.rememberDevice = !!rememberDevice;
            }
            data = omit(data, 'rememberDevice');

          } else if (data.profile &&
                    data.profile.updatePhone !== undefined) {
            if (data.profile.updatePhone) {
              params.updatePhone = true;
            }
            data.profile = omit(data.profile, 'updatePhone');
          }
          var href = link.href + toQueryString(params);
          return postToTransaction(sdk, href, data);
        };
    }
  }
}

function links2fns(sdk, res, obj, ref) {
  var fns = {} as AuthTransactionFunctions;
  for (var linkName in obj._links) {
    if (!Object.prototype.hasOwnProperty.call(obj._links, linkName)) {
      continue;
    }

    var link = obj._links[linkName];
    
    if (linkName === 'next') {
      linkName = link.name;
    }

    if (link.type) {
      fns[linkName] = link;
      continue;
    }

    switch (linkName) {
      // poll is only found at the transaction
      // level, so we don't need to pass the link
      case 'poll':
        fns.poll = getPollFn(sdk, res, ref);
        break;

      default:
        var fn = link2fn(sdk, res, obj, link, ref);
        if (fn) {
          fns[linkName] = fn;
        }
    }
  }
  return fns;
}

// eslint-disable-next-line complexity
function flattenEmbedded(sdk, res, obj, ref) {
  obj = obj || res;
  obj = clone(obj);

  if (Array.isArray(obj)) {
    var objArr = [];
    for (var o = 0, ol = obj.length; o < ol; o++) {
      objArr.push(flattenEmbedded(sdk, res, obj[o], ref));
    }
    return objArr;
  }

  var embedded = obj._embedded || {};

  for (var key in embedded) {
    if (!Object.prototype.hasOwnProperty.call(embedded, key)) {
      continue;
    }

    // Flatten any nested _embedded objects
    if (isObject(embedded[key]) || Array.isArray(embedded[key])) {
      embedded[key] = flattenEmbedded(sdk, res, embedded[key], ref);
    }
  }

  // Convert any links on the embedded object
  var fns = links2fns(sdk, res, obj, ref);
  Object.assign(embedded, fns);

  obj = omit(obj, '_embedded', '_links');
  Object.assign(obj, embedded);
  return obj;
}
