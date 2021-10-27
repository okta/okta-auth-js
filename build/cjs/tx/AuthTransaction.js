"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.AuthTransaction = void 0;

var _http = require("../http");

var _util = require("../util");

var _AuthSdkError = _interopRequireDefault(require("../errors/AuthSdkError"));

var _util2 = require("./util");

var _poll = require("./poll");

var _api = require("./api");

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
class AuthTransaction {
  constructor(sdk, res = null) {
    if (res) {
      this.data = res;

      if (this.data.interactionHandle) {
        this.status = res.status;
        return;
      } // Parse response from Authn V1


      Object.assign(this, flattenEmbedded(sdk, res, res, {}));
      delete this.stateToken; // RECOVERY_CHALLENGE has some responses without _links.
      // Without _links, we emulate cancel to make it intuitive
      // to return to the starting state. We may remove this
      // when OKTA-75434 is resolved

      if (res.status === 'RECOVERY_CHALLENGE' && !res._links) {
        this.cancel = function () {
          return Promise.resolve(new AuthTransaction(sdk));
        };
      }
    }
  }

}

exports.AuthTransaction = AuthTransaction;

function link2fn(sdk, res, obj, link, ref) {
  if (Array.isArray(link)) {
    return function (name, opts) {
      if (!name) {
        throw new _AuthSdkError.default('Must provide a link name');
      }

      var lk = (0, _util.find)(link, {
        name: name
      });

      if (!lk) {
        throw new _AuthSdkError.default('No link found for that name');
      }

      return link2fn(sdk, res, obj, lk, ref)(opts);
    };
  } else if (link.hints && link.hints.allow && link.hints.allow.length === 1) {
    var method = link.hints.allow[0];

    switch (method) {
      case 'GET':
        return function () {
          return (0, _http.get)(sdk, link.href, {
            withCredentials: true
          });
        };

      case 'POST':
        // eslint-disable-next-line max-statements,complexity
        return function (opts) {
          if (ref && ref.isPolling) {
            ref.isPolling = false;
          }

          var data = (0, _util2.addStateToken)(res, opts);

          if (res.status === 'MFA_ENROLL' || res.status === 'FACTOR_ENROLL') {
            // Add factorType and provider
            Object.assign(data, {
              factorType: obj.factorType,
              provider: obj.provider
            });
          }

          var params = {};
          var autoPush = data.autoPush;

          if (autoPush !== undefined) {
            if (typeof autoPush === 'function') {
              try {
                params.autoPush = !!autoPush();
              } catch (e) {
                return Promise.reject(new _AuthSdkError.default('AutoPush resulted in an error.'));
              }
            } else if (autoPush !== null) {
              params.autoPush = !!autoPush;
            }

            data = (0, _util.omit)(data, 'autoPush');
          }

          var rememberDevice = data.rememberDevice;

          if (rememberDevice !== undefined) {
            if (typeof rememberDevice === 'function') {
              try {
                params.rememberDevice = !!rememberDevice();
              } catch (e) {
                return Promise.reject(new _AuthSdkError.default('RememberDevice resulted in an error.'));
              }
            } else if (rememberDevice !== null) {
              params.rememberDevice = !!rememberDevice;
            }

            data = (0, _util.omit)(data, 'rememberDevice');
          } else if (data.profile && data.profile.updatePhone !== undefined) {
            if (data.profile.updatePhone) {
              params.updatePhone = true;
            }

            data.profile = (0, _util.omit)(data.profile, 'updatePhone');
          }

          var href = link.href + (0, _util.toQueryString)(params);
          return (0, _api.postToTransaction)(sdk, href, data, {
            withCredentials: true
          });
        };
    }
  }
}

function links2fns(sdk, res, obj, ref) {
  var fns = {};

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
        fns.poll = (0, _poll.getPollFn)(sdk, res, ref);
        break;

      default:
        var fn = link2fn(sdk, res, obj, link, ref);

        if (fn) {
          fns[linkName] = fn;
        }

    }
  }

  return fns;
} // eslint-disable-next-line complexity


function flattenEmbedded(sdk, res, obj, ref) {
  obj = obj || res;
  obj = (0, _util.clone)(obj);

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
    } // Flatten any nested _embedded objects


    if ((0, _util.isObject)(embedded[key]) || Array.isArray(embedded[key])) {
      embedded[key] = flattenEmbedded(sdk, res, embedded[key], ref);
    }
  } // Convert any links on the embedded object


  var fns = links2fns(sdk, res, obj, ref);
  Object.assign(embedded, fns);
  obj = (0, _util.omit)(obj, '_embedded', '_links');
  Object.assign(obj, embedded);
  return obj;
}
//# sourceMappingURL=AuthTransaction.js.map