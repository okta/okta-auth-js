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
export class VerifyAuthenticator extends Remediator {
  constructor() {
    super(...arguments);

    _defineProperty(this, "map", {
      'credentials': []
    });
  }

  canRemediate() {
    var challengeType = this.getRelatesToType();

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
    var challengeType = this.getRelatesToType();
    var name = challengeType === 'password' ? 'password' : 'verificationCode';
    return _objectSpread(_objectSpread({}, input.form.value[0]), {}, {
      name,
      type: 'string',
      required: input.required
    });
  }

}

_defineProperty(VerifyAuthenticator, "remediationName", 'challenge-authenticator');
//# sourceMappingURL=VerifyAuthenticator.js.map