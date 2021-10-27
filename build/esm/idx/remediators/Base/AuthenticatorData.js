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
// Base class - DO NOT expose static remediationName
export class AuthenticatorData extends Remediator {
  constructor(remediation) {
    var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    super(remediation, values); // Unify authenticator input type

    _defineProperty(this, "map", {
      'authenticator': []
    });

    var {
      authenticators
    } = this.values;
    var authenticatorType = this.getRelatesToType();
    var authenticator = authenticators === null || authenticators === void 0 ? void 0 : authenticators.find(authenticator => authenticator.type === authenticatorType);

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
    var common = super.getNextStep();
    var options = this.getMethodTypes();
    return _objectSpread(_objectSpread({}, common), options && {
      options
    });
  } // Grab authenticator from authenticators list


  getAuthenticatorFromValues() {
    if (!this.values.authenticators) {
      return null;
    }

    var authenticatorType = this.getRelatesToType();
    var authenticator = this.values.authenticators.find(authenticator => authenticator.type === authenticatorType);
    return authenticator;
  }

  mapAuthenticatorFromValues(authenticator) {
    // add methodType to authenticator if it exists in values
    var type = this.getRelatesToType();
    var {
      methodType
    } = this.values;
    return _objectSpread(_objectSpread({
      type
    }, authenticator && authenticator), methodType && {
      methodType
    });
  }

  getAuthenticatorFromRemediation() {
    var authenticator = this.remediation.value.find(_ref => {
      var {
        name
      } = _ref;
      return name === 'authenticator';
    });
    return authenticator;
  }

  getMethodTypes() {
    var _authenticator$form$v;

    var authenticator = this.getAuthenticatorFromRemediation();
    return (_authenticator$form$v = authenticator.form.value.find(_ref2 => {
      var {
        name
      } = _ref2;
      return name === 'methodType';
    })) === null || _authenticator$form$v === void 0 ? void 0 : _authenticator$form$v.options;
  }

}
//# sourceMappingURL=AuthenticatorData.js.map