"use strict";

Object.defineProperty(exports, "IdxMessage", {
  enumerable: true,
  get: function () {
    return _idxJs.IdxMessage;
  }
});
Object.defineProperty(exports, "AuthenticationOptions", {
  enumerable: true,
  get: function () {
    return _authenticate.AuthenticationOptions;
  }
});
Object.defineProperty(exports, "RegistrationOptions", {
  enumerable: true,
  get: function () {
    return _register.RegistrationOptions;
  }
});
Object.defineProperty(exports, "PasswordRecoveryOptions", {
  enumerable: true,
  get: function () {
    return _recoverPassword.PasswordRecoveryOptions;
  }
});
Object.defineProperty(exports, "CancelOptions", {
  enumerable: true,
  get: function () {
    return _cancel.CancelOptions;
  }
});
exports.IdxFeature = exports.IdxStatus = void 0;

var _idxJs = require("./idx-js");

var _authenticate = require("../authenticate");

var _register = require("../register");

var _recoverPassword = require("../recoverPassword");

var _cancel = require("../cancel");

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
let IdxStatus;
exports.IdxStatus = IdxStatus;

(function (IdxStatus) {
  IdxStatus[IdxStatus["SUCCESS"] = 0] = "SUCCESS";
  IdxStatus[IdxStatus["PENDING"] = 1] = "PENDING";
  IdxStatus[IdxStatus["FAILURE"] = 2] = "FAILURE";
  IdxStatus[IdxStatus["TERMINAL"] = 3] = "TERMINAL";
  IdxStatus[IdxStatus["CANCELED"] = 4] = "CANCELED";
})(IdxStatus || (exports.IdxStatus = IdxStatus = {}));

let IdxFeature;
exports.IdxFeature = IdxFeature;

(function (IdxFeature) {
  IdxFeature[IdxFeature["PASSWORD_RECOVERY"] = 0] = "PASSWORD_RECOVERY";
  IdxFeature[IdxFeature["REGISTRATION"] = 1] = "REGISTRATION";
  IdxFeature[IdxFeature["SOCIAL_IDP"] = 2] = "SOCIAL_IDP";
})(IdxFeature || (exports.IdxFeature = IdxFeature = {}));
//# sourceMappingURL=index.js.map