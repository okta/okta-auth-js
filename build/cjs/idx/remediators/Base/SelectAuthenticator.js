"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.SelectAuthenticator = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _Remediator = require("./Remediator");

var _util = require("../util");

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
// Find matched authenticator in provided order
function findMatchedOption(authenticators, options) {
  let option;

  for (let authenticator of authenticators) {
    option = options.find(({
      relatesTo
    }) => relatesTo.type === authenticator.type);

    if (option) {
      break;
    }
  }

  return option;
}

// Base class - DO NOT expose static remediationName
class SelectAuthenticator extends _Remediator.Remediator {
  constructor(remediation, values = {}) {
    super(remediation, values); // Unify authenticator input type

    (0, _defineProperty2.default)(this, "map", {
      authenticator: []
    });
    const {
      authenticator: selectedAuthenticator,
      authenticators
    } = this.values;
    const hasSelectedAuthenticatorInList = authenticators === null || authenticators === void 0 ? void 0 : authenticators.some(authenticator => authenticator.type === selectedAuthenticator);

    if (selectedAuthenticator && !hasSelectedAuthenticatorInList) {
      // add selected authenticator to list
      this.values.authenticators = [...(authenticators || []), {
        type: selectedAuthenticator
      }];
    }
  }

  canRemediate() {
    const {
      authenticators
    } = this.values;
    const authenticatorFromRemediation = (0, _util.getAuthenticatorFromRemediation)(this.remediation);
    const {
      options
    } = authenticatorFromRemediation; // Let users select authenticator if no input is provided

    if (!authenticators || !authenticators.length) {
      return false;
    } // Proceed with provided authenticators


    const matchedOption = findMatchedOption(authenticators, options);

    if (matchedOption) {
      return true;
    }

    return false;
  }

  getNextStep() {
    const common = super.getNextStep();
    const authenticatorFromRemediation = (0, _util.getAuthenticatorFromRemediation)(this.remediation);
    const options = authenticatorFromRemediation.options.map(option => {
      const {
        label,
        relatesTo: {
          type
        }
      } = option;
      return {
        label,
        value: type
      };
    });
    return { ...common,
      options
    };
  }

  mapAuthenticator(remediationValue) {
    const {
      authenticators
    } = this.values;
    const {
      options
    } = remediationValue;
    const selectedOption = findMatchedOption(authenticators, options);
    return {
      id: selectedOption === null || selectedOption === void 0 ? void 0 : selectedOption.value.form.value.find(({
        name
      }) => name === 'id').value
    };
  }

  getInputAuthenticator() {
    return {
      name: 'authenticator',
      type: 'string'
    };
  }

}

exports.SelectAuthenticator = SelectAuthenticator;
//# sourceMappingURL=SelectAuthenticator.js.map