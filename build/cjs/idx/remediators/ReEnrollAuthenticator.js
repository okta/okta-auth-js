"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.ReEnrollAuthenticator = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _Remediator = require("./Base/Remediator");

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
class ReEnrollAuthenticator extends _Remediator.Remediator {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "map", {
      'credentials': []
    });
  }

  mapCredentials() {
    return {
      passcode: this.values.newPassword
    };
  }

  getInputCredentials(input) {
    const challengeType = this.getRelatesToType();
    const name = challengeType === 'password' ? 'newPassword' : 'verificationCode';
    return { ...input.form.value[0],
      name
    };
  }

}

exports.ReEnrollAuthenticator = ReEnrollAuthenticator;
(0, _defineProperty2.default)(ReEnrollAuthenticator, "remediationName", 'reenroll-authenticator');
//# sourceMappingURL=ReEnrollAuthenticator.js.map