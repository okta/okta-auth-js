"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.AuthenticatorEnrollmentData = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _AuthenticatorData = require("./Base/AuthenticatorData");

var _util = require("./util");

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
class AuthenticatorEnrollmentData extends _AuthenticatorData.AuthenticatorData {
  canRemediate() {
    const authenticator = this.getAuthenticatorFromValues();
    return !!(authenticator && authenticator.methodType && authenticator.phoneNumber);
  }

  mapAuthenticator() {
    const authenticatorFromValues = this.getAuthenticatorFromValues();
    const authenticatorFromRemediation = (0, _util.getAuthenticatorFromRemediation)(this.remediation);
    return {
      id: authenticatorFromRemediation.form.value.find(({
        name
      }) => name === 'id').value,
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

    const {
      phoneNumber
    } = this.values;
    return { ...authenticator,
      ...(phoneNumber && {
        phoneNumber
      })
    };
  }

}

exports.AuthenticatorEnrollmentData = AuthenticatorEnrollmentData;
(0, _defineProperty2.default)(AuthenticatorEnrollmentData, "remediationName", 'authenticator-enrollment-data');
//# sourceMappingURL=AuthenticatorEnrollmentData.js.map