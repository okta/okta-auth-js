"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.Identify = void 0;

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
class Identify extends _Remediator.Remediator {
  constructor(remediation, values) {
    super(remediation, values); // add password authenticator to authenticators list if password is provided

    (0, _defineProperty2.default)(this, "map", {
      'identifier': ['username'],
      'credentials': []
    });
    const {
      password,
      authenticators
    } = this.values;

    if (password && !authenticators.some(authenticator => authenticator.type === 'password')) {
      this.values = { ...this.values,
        authenticators: [{
          type: 'password'
        }, ...authenticators]
      };
    }
  }

  canRemediate() {
    const {
      identifier
    } = this.getData();
    return !!identifier;
  }

  mapCredentials() {
    return {
      passcode: this.values.password
    };
  }

  getInputCredentials(input) {
    return { ...input.form.value[0],
      name: 'password',
      required: input.required
    };
  }

  getValuesAfterProceed() {
    // Handle username + password scenario
    // remove "password" from authenticator array when remediation is finished
    if (this.remediation.value.some(({
      name
    }) => name === 'credentials')) {
      var _this$values$authenti;

      const authenticators = (_this$values$authenti = this.values.authenticators) === null || _this$values$authenti === void 0 ? void 0 : _this$values$authenti.filter(authenticator => authenticator.type !== 'password');
      return { ...this.values,
        authenticators
      };
    }

    return super.getValuesAfterProceed();
  }

}

exports.Identify = Identify;
(0, _defineProperty2.default)(Identify, "remediationName", 'identify');
//# sourceMappingURL=Identify.js.map