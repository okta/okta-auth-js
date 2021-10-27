"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.AuthenticatorData = void 0;

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
class AuthenticatorData extends _Remediator.Remediator {
  constructor(remediation, values = {}) {
    super(remediation, values); // Unify authenticator input type

    (0, _defineProperty2.default)(this, "map", {
      'authenticator': []
    });
    const {
      authenticators
    } = this.values;
    const authenticatorType = this.getRelatesToType();
    const authenticator = authenticators === null || authenticators === void 0 ? void 0 : authenticators.find(authenticator => authenticator.type === authenticatorType);

    if (authenticator) {
      // map
      this.values.authenticators = authenticators.map(authenticator => {
        if (authenticatorType === authenticator.type) {
          return this.mapAuthenticatorFromValues(authenticator);
        }

        return authenticator;
      });
    } else {
      // add
      this.values.authenticators = [...authenticators, this.mapAuthenticatorFromValues()];
    }
  }

  getNextStep() {
    const common = super.getNextStep();
    const options = this.getMethodTypes();
    return { ...common,
      ...(options && {
        options
      })
    };
  } // Grab authenticator from authenticators list


  getAuthenticatorFromValues() {
    if (!this.values.authenticators) {
      return null;
    }

    const authenticatorType = this.getRelatesToType();
    const authenticator = this.values.authenticators.find(authenticator => authenticator.type === authenticatorType);
    return authenticator;
  }

  mapAuthenticatorFromValues(authenticator) {
    // add methodType to authenticator if it exists in values
    const type = this.getRelatesToType();
    const {
      methodType
    } = this.values;
    return {
      type,
      ...(authenticator && authenticator),
      ...(methodType && {
        methodType
      })
    };
  }

  getAuthenticatorFromRemediation() {
    const authenticator = this.remediation.value.find(({
      name
    }) => name === 'authenticator');
    return authenticator;
  }

  getMethodTypes() {
    var _authenticator$form$v;

    const authenticator = this.getAuthenticatorFromRemediation();
    return (_authenticator$form$v = authenticator.form.value.find(({
      name
    }) => name === 'methodType')) === null || _authenticator$form$v === void 0 ? void 0 : _authenticator$form$v.options;
  }

}

exports.AuthenticatorData = AuthenticatorData;
//# sourceMappingURL=AuthenticatorData.js.map