"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.VerifyAuthenticator = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _Remediator = require("./Remediator");

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
// Base class - DO NOT expose static remediationName
class VerifyAuthenticator extends _Remediator.Remediator {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "map", {
      'credentials': []
    });
  }

  canRemediate() {
    const challengeType = this.getRelatesToType();

    if (this.values.verificationCode && ['email', 'phone'].includes(challengeType)) {
      return true;
    }

    if (this.values.password && challengeType === 'password') {
      return true;
    }

    return false;
  }

  mapCredentials() {
    return {
      passcode: this.values.verificationCode || this.values.password
    };
  }

  getInputCredentials(input) {
    const challengeType = this.getRelatesToType();
    const name = challengeType === 'password' ? 'password' : 'verificationCode';
    return { ...input.form.value[0],
      name,
      type: 'string',
      required: input.required
    };
  }

}

exports.VerifyAuthenticator = VerifyAuthenticator;
(0, _defineProperty2.default)(VerifyAuthenticator, "remediationName", 'challenge-authenticator');
//# sourceMappingURL=VerifyAuthenticator.js.map