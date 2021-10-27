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
import { AuthenticatorData } from './Base/AuthenticatorData';
import { getAuthenticatorFromRemediation } from './util';
export class AuthenticatorEnrollmentData extends AuthenticatorData {
  canRemediate() {
    var authenticator = this.getAuthenticatorFromValues();
    return !!(authenticator && authenticator.methodType && authenticator.phoneNumber);
  }

  mapAuthenticator() {
    var authenticatorFromValues = this.getAuthenticatorFromValues();
    var authenticatorFromRemediation = getAuthenticatorFromRemediation(this.remediation);
    return {
      id: authenticatorFromRemediation.form.value.find(_ref => {
        var {
          name
        } = _ref;
        return name === 'id';
      }).value,
      methodType: authenticatorFromValues.methodType,
      phoneNumber: authenticatorFromValues.phoneNumber
    };
  }

  getInputAuthenticator() {
    return [{
      name: 'methodType',
      type: 'string',
      required: true
    }, {
      name: 'phoneNumber',
      type: 'string',
      required: true
    }];
  }

  mapAuthenticatorFromValues(authenticator) {
    // get mapped authenticator from base class
    authenticator = super.mapAuthenticatorFromValues(authenticator); // add phoneNumber to authenticator if it exists in values

    var {
      phoneNumber
    } = this.values;
    return _objectSpread(_objectSpread({}, authenticator), phoneNumber && {
      phoneNumber
    });
  }

}

_defineProperty(AuthenticatorEnrollmentData, "remediationName", 'authenticator-enrollment-data');
//# sourceMappingURL=AuthenticatorEnrollmentData.js.map