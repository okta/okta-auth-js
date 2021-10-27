"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.transactionStatus = transactionStatus;
exports.resumeTransaction = resumeTransaction;
exports.transactionExists = transactionExists;
exports.postToTransaction = postToTransaction;
exports.introspect = introspect;

var _http = require("../http");

var _AuthSdkError = _interopRequireDefault(require("../errors/AuthSdkError"));

var _constants = require("../constants");

var _util = require("./util");

var _AuthTransaction = require("./AuthTransaction");

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
function transactionStatus(sdk, args) {
  args = (0, _util.addStateToken)(sdk, args);
  return (0, _http.post)(sdk, sdk.getIssuerOrigin() + '/api/v1/authn', args, {
    withCredentials: true
  });
}

function resumeTransaction(sdk, args) {
  if (!args || !args.stateToken) {
    var stateToken = sdk.tx.exists._get(_constants.STATE_TOKEN_KEY_NAME);

    if (stateToken) {
      args = {
        stateToken: stateToken
      };
    } else {
      return Promise.reject(new _AuthSdkError.default('No transaction to resume'));
    }
  }

  return sdk.tx.status(args).then(function (res) {
    return new _AuthTransaction.AuthTransaction(sdk, res);
  });
}

function introspect(sdk, args) {
  if (!args || !args.stateToken) {
    var stateToken = sdk.tx.exists._get(_constants.STATE_TOKEN_KEY_NAME);

    if (stateToken) {
      args = {
        stateToken: stateToken
      };
    } else {
      return Promise.reject(new _AuthSdkError.default('No transaction to evaluate'));
    }
  }

  return transactionStep(sdk, args).then(function (res) {
    return new _AuthTransaction.AuthTransaction(sdk, res);
  });
}

function transactionStep(sdk, args) {
  args = (0, _util.addStateToken)(sdk, args); // v1 pipeline introspect API

  return (0, _http.post)(sdk, sdk.getIssuerOrigin() + '/api/v1/authn/introspect', args, {
    withCredentials: true
  });
}

function transactionExists(sdk) {
  // We have a cookie state token
  return !!sdk.tx.exists._get(_constants.STATE_TOKEN_KEY_NAME);
}

function postToTransaction(sdk, url, args, options) {
  return (0, _http.post)(sdk, url, args, options).then(function (res) {
    return new _AuthTransaction.AuthTransaction(sdk, res);
  });
}
//# sourceMappingURL=api.js.map