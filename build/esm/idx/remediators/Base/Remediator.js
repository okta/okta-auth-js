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

/* eslint-disable complexity */
import { AuthSdkError } from '../../../errors';
import { getAllValues, getRequiredValues, titleCase } from '../util'; // A map from IDX data values (server spec) to RemediationValues (client spec)

// Base class - DO NOT expose static remediationName
export class Remediator {
  constructor(remediation) {
    var _values$authenticator;

    var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    // map authenticators to Authenticator[] type
    values.authenticators = ((_values$authenticator = values.authenticators) === null || _values$authenticator === void 0 ? void 0 : _values$authenticator.map(authenticator => {
      return typeof authenticator === 'string' ? {
        type: authenticator
      } : authenticator;
    })) || []; // assign fields to the instance

    this.values = values;
    this.remediation = remediation;
  }

  getName() {
    return this.remediation.name;
  } // Override this method to provide custom check


  canRemediate() {
    if (!this.map) {
      return false;
    }

    var required = getRequiredValues(this.remediation);
    var needed = required.find(key => !this.hasData(key));

    if (needed) {
      return false; // missing data for a required field
    }

    return true; // all required fields have available data
  } // returns an object for the entire remediation form, or just a part


  getData(key) {
    if (!key) {
      var allValues = getAllValues(this.remediation);
      var res = allValues.reduce((data, key) => {
        data[key] = this.getData(key); // recursive

        return data;
      }, {});
      return res;
    } // Map value by "map${Property}" function in each subClass


    if (typeof this["map".concat(titleCase(key))] === 'function') {
      return this["map".concat(titleCase(key))](this.remediation.value.find(_ref => {
        var {
          name
        } = _ref;
        return name === key;
      }));
    }

    if (!this.map) {
      return this.values[key];
    } // Handle general primitive types


    var entry = this.map[key];

    if (!entry) {
      return this.values[key];
    } // find the first aliased property that returns a truthy value


    for (var i = 0; i < entry.length; i++) {
      var val = this.values[entry[i]];

      if (val) {
        return val;
      }
    }
  }

  hasData(key) {
    // no attempt to format, we want simple true/false
    // First see if the remediation has a mapping for this vale
    var data = this.getData(key);

    if (typeof data === 'object') {
      return !!Object.keys(data).find(key => !!data[key]);
    }

    return !!data;
  }

  getNextStep() {
    var name = this.getName();
    var type = this.getRelatesToType();
    var inputs = this.getInputs();
    return _objectSpread({
      name,
      inputs
    }, type && {
      type
    });
  } // Get inputs for the next step


  getInputs() {
    if (!this.map) {
      return [];
    }

    return Object.keys(this.map).reduce((inputs, key) => {
      var inputFromRemediation = this.remediation.value.find(item => item.name === key);

      if (!inputFromRemediation) {
        return inputs;
      }

      var input;
      var aliases = this.map[key];
      var {
        type
      } = inputFromRemediation;

      if (typeof this["getInput".concat(titleCase(key))] === 'function') {
        input = this["getInput".concat(titleCase(key))](inputFromRemediation);
      } else if (type !== 'object') {
        // handle general primitive types
        var name;

        if (aliases.length === 1) {
          name = aliases[0];
        } else {
          // try find key from values
          name = aliases.find(name => Object.keys(this.values).includes(name));
        }

        if (name) {
          input = _objectSpread(_objectSpread({}, inputFromRemediation), {}, {
            name
          });
        }
      }

      if (!input) {
        throw new AuthSdkError("Missing custom getInput".concat(titleCase(key), " method in Remediator: ").concat(this.getName()));
      }

      if (Array.isArray(input)) {
        input.forEach(i => inputs.push(i));
      } else {
        inputs.push(input);
      }

      return inputs;
    }, []);
  } // Override this method to grab messages per remediation


  getMessages() {
    var _this$remediation$val, _this$remediation$val2;

    if (!this.remediation.value) {
      return;
    }

    return (_this$remediation$val = this.remediation.value[0]) === null || _this$remediation$val === void 0 ? void 0 : (_this$remediation$val2 = _this$remediation$val.form) === null || _this$remediation$val2 === void 0 ? void 0 : _this$remediation$val2.value.reduce((messages, field) => {
      if (field.messages) {
        messages = [...messages, ...field.messages.value];
      }

      return messages;
    }, []);
  } // Prepare values for the next remediation
  // In general, remove finished authenticator from list


  getValuesAfterProceed() {
    var _this$values$authenti;

    var authenticatorType = this.getRelatesToType();
    var authenticators = (_this$values$authenti = this.values.authenticators) === null || _this$values$authenti === void 0 ? void 0 : _this$values$authenti.filter(authenticator => authenticator.type !== authenticatorType);
    return _objectSpread(_objectSpread({}, this.values), {}, {
      authenticators
    });
  }

  getRelatesToType() {
    var _this$remediation$rel;

    return (_this$remediation$rel = this.remediation.relatesTo) === null || _this$remediation$rel === void 0 ? void 0 : _this$remediation$rel.value.type;
  }

}
//# sourceMappingURL=Remediator.js.map