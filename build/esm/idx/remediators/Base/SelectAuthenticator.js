import _defineProperty from "@babel/runtime/helpers/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
import { Remediator } from './Remediator';
import { getAuthenticatorFromRemediation } from '../util';

// Find matched authenticator in provided order
function findMatchedOption(authenticators, options) {
  var option;

  var _loop = function _loop(authenticator) {
    option = options.find(_ref => {
      var {
        relatesTo
      } = _ref;
      return relatesTo.type === authenticator.type;
    });

    if (option) {
      return "break";
    }
  };

  for (var authenticator of authenticators) {
    var _ret = _loop(authenticator);

    if (_ret === "break") break;
  }

  return option;
}

// Base class - DO NOT expose static remediationName
export class SelectAuthenticator extends Remediator {
  constructor(remediation) {
    var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    super(remediation, values); // Unify authenticator input type

    _defineProperty(this, "map", {
      authenticator: []
    });

    var {
      authenticator: selectedAuthenticator,
      authenticators
    } = this.values;
    var hasSelectedAuthenticatorInList = authenticators === null || authenticators === void 0 ? void 0 : authenticators.some(authenticator => authenticator.type === selectedAuthenticator);

    if (selectedAuthenticator && !hasSelectedAuthenticatorInList) {
      // add selected authenticator to list
      this.values.authenticators = [...(authenticators || []), {
        type: selectedAuthenticator
      }];
    }
  }

  canRemediate() {
    var {
      authenticators
    } = this.values;
    var authenticatorFromRemediation = getAuthenticatorFromRemediation(this.remediation);
    var {
      options
    } = authenticatorFromRemediation; // Let users select authenticator if no input is provided

    if (!authenticators || !authenticators.length) {
      return false;
    } // Proceed with provided authenticators


    var matchedOption = findMatchedOption(authenticators, options);

    if (matchedOption) {
      return true;
    }

    return false;
  }

  getNextStep() {
    var common = super.getNextStep();
    var authenticatorFromRemediation = getAuthenticatorFromRemediation(this.remediation);
    var options = authenticatorFromRemediation.options.map(option => {
      var {
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
    return _objectSpread(_objectSpread({}, common), {}, {
      options
    });
  }

  mapAuthenticator(remediationValue) {
    var {
      authenticators
    } = this.values;
    var {
      options
    } = remediationValue;
    var selectedOption = findMatchedOption(authenticators, options);
    return {
      id: selectedOption === null || selectedOption === void 0 ? void 0 : selectedOption.value.form.value.find(_ref2 => {
        var {
          name
        } = _ref2;
        return name === 'id';
      }).value
    };
  }

  getInputAuthenticator() {
    return {
      name: 'authenticator',
      type: 'string'
    };
  }

}
//# sourceMappingURL=SelectAuthenticator.js.map