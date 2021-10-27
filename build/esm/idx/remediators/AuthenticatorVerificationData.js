import _defineProperty from "@babel/runtime/helpers/defineProperty";

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
export class AuthenticatorVerificationData extends AuthenticatorData {
  canRemediate() {
    var authenticator = this.getAuthenticatorFromValues();
    return !!(authenticator && authenticator.methodType);
  }

  mapAuthenticator() {
    var authenticatorFromRemediation = this.getAuthenticatorFromRemediation();
    var authenticatorFromValues = this.getAuthenticatorFromValues();
    return {
      id: authenticatorFromRemediation.form.value.find(_ref => {
        var {
          name
        } = _ref;
        return name === 'id';
      }).value,
      enrollmentId: authenticatorFromRemediation.form.value.find(_ref2 => {
        var {
          name
        } = _ref2;
        return name === 'enrollmentId';
      }).value,
      methodType: authenticatorFromValues.methodType
    };
  }

  getInputAuthenticator() {
    var authenticator = this.getAuthenticatorFromRemediation();
    var methodType = authenticator.form.value.find(_ref3 => {
      var {
        name
      } = _ref3;
      return name === 'methodType';
    }); // if has methodType in form, let user select the methodType

    if (methodType && methodType.options) {
      return {
        name: 'methodType',
        type: 'string',
        required: true
      };
    } // no methodType, then return form values


    var inputs = [...authenticator.form.value];
    return inputs;
  }

}

_defineProperty(AuthenticatorVerificationData, "remediationName", 'authenticator-verification-data');
//# sourceMappingURL=AuthenticatorVerificationData.js.map