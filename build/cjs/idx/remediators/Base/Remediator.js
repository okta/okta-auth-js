"use strict";

exports.Remediator = void 0;

var _errors = require("../../../errors");

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

/* eslint-disable complexity */
// Base class - DO NOT expose static remediationName
class Remediator {
  constructor(remediation, values = {}) {
    var _values$authenticator;

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

    const required = (0, _util.getRequiredValues)(this.remediation);
    const needed = required.find(key => !this.hasData(key));

    if (needed) {
      return false; // missing data for a required field
    }

    return true; // all required fields have available data
  } // returns an object for the entire remediation form, or just a part


  getData(key) {
    if (!key) {
      let allValues = (0, _util.getAllValues)(this.remediation);
      let res = allValues.reduce((data, key) => {
        data[key] = this.getData(key); // recursive

        return data;
      }, {});
      return res;
    } // Map value by "map${Property}" function in each subClass


    if (typeof this[`map${(0, _util.titleCase)(key)}`] === 'function') {
      return this[`map${(0, _util.titleCase)(key)}`](this.remediation.value.find(({
        name
      }) => name === key));
    }

    if (!this.map) {
      return this.values[key];
    } // Handle general primitive types


    const entry = this.map[key];

    if (!entry) {
      return this.values[key];
    } // find the first aliased property that returns a truthy value


    for (let i = 0; i < entry.length; i++) {
      let val = this.values[entry[i]];

      if (val) {
        return val;
      }
    }
  }

  hasData(key) {
    // no attempt to format, we want simple true/false
    // First see if the remediation has a mapping for this vale
    const data = this.getData(key);

    if (typeof data === 'object') {
      return !!Object.keys(data).find(key => !!data[key]);
    }

    return !!data;
  }

  getNextStep() {
    const name = this.getName();
    const type = this.getRelatesToType();
    const inputs = this.getInputs();
    return {
      name,
      inputs,
      ...(type && {
        type
      })
    };
  } // Get inputs for the next step


  getInputs() {
    if (!this.map) {
      return [];
    }

    return Object.keys(this.map).reduce((inputs, key) => {
      const inputFromRemediation = this.remediation.value.find(item => item.name === key);

      if (!inputFromRemediation) {
        return inputs;
      }

      let input;
      const aliases = this.map[key];
      const {
        type
      } = inputFromRemediation;

      if (typeof this[`getInput${(0, _util.titleCase)(key)}`] === 'function') {
        input = this[`getInput${(0, _util.titleCase)(key)}`](inputFromRemediation);
      } else if (type !== 'object') {
        // handle general primitive types
        let name;

        if (aliases.length === 1) {
          name = aliases[0];
        } else {
          // try find key from values
          name = aliases.find(name => Object.keys(this.values).includes(name));
        }

        if (name) {
          input = { ...inputFromRemediation,
            name
          };
        }
      }

      if (!input) {
        throw new _errors.AuthSdkError(`Missing custom getInput${(0, _util.titleCase)(key)} method in Remediator: ${this.getName()}`);
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

    const authenticatorType = this.getRelatesToType();
    const authenticators = (_this$values$authenti = this.values.authenticators) === null || _this$values$authenti === void 0 ? void 0 : _this$values$authenti.filter(authenticator => authenticator.type !== authenticatorType);
    return { ...this.values,
      authenticators
    };
  }

  getRelatesToType() {
    var _this$remediation$rel;

    return (_this$remediation$rel = this.remediation.relatesTo) === null || _this$remediation$rel === void 0 ? void 0 : _this$remediation$rel.value.type;
  }

}

exports.Remediator = Remediator;
//# sourceMappingURL=Remediator.js.map