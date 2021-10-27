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
import { Remediator } from './Base/Remediator';
export class Identify extends Remediator {
  constructor(remediation, values) {
    super(remediation, values); // add password authenticator to authenticators list if password is provided

    _defineProperty(this, "map", {
      'identifier': ['username'],
      'credentials': []
    });

    var {
      password,
      authenticators
    } = this.values;

    if (password && !authenticators.some(authenticator => authenticator.type === 'password')) {
      this.values = _objectSpread(_objectSpread({}, this.values), {}, {
        authenticators: [{
          type: 'password'
        }, ...authenticators]
      });
    }
  }

  canRemediate() {
    var {
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
    return _objectSpread(_objectSpread({}, input.form.value[0]), {}, {
      name: 'password',
      required: input.required
    });
  }

  getValuesAfterProceed() {
    // Handle username + password scenario
    // remove "password" from authenticator array when remediation is finished
    if (this.remediation.value.some(_ref => {
      var {
        name
      } = _ref;
      return name === 'credentials';
    })) {
      var _this$values$authenti;

      var authenticators = (_this$values$authenti = this.values.authenticators) === null || _this$values$authenti === void 0 ? void 0 : _this$values$authenti.filter(authenticator => authenticator.type !== 'password');
      return _objectSpread(_objectSpread({}, this.values), {}, {
        authenticators
      });
    }

    return super.getValuesAfterProceed();
  }

}

_defineProperty(Identify, "remediationName", 'identify');
//# sourceMappingURL=Identify.js.map