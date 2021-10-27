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
export class EnrollProfile extends Remediator {
  constructor() {
    super(...arguments);

    _defineProperty(this, "map", {
      'userProfile': []
    });
  }

  mapUserProfile(_ref) {
    var {
      form: {
        value: profileAttributes
      }
    } = _ref;
    var attributeNames = profileAttributes.map(_ref2 => {
      var {
        name
      } = _ref2;
      return name;
    });
    return attributeNames.reduce((attributeValues, attributeName) => this.values[attributeName] ? _objectSpread(_objectSpread({}, attributeValues), {}, {
      [attributeName]: this.values[attributeName]
    }) : attributeValues, {});
  }

  getInputUserProfile(input) {
    return [...input.form.value];
  }

  getErrorMessages(errorRemediation) {
    return errorRemediation.value[0].form.value.reduce((errors, field) => {
      if (field.messages) {
        errors.push(field.messages.value[0].message);
      }

      return errors;
    }, []);
  }

}

_defineProperty(EnrollProfile, "remediationName", 'enroll-profile');
//# sourceMappingURL=EnrollProfile.js.map