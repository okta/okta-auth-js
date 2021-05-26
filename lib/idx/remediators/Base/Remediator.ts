/* eslint-disable complexity */
import { AuthSdkError } from '../../../errors';
import { NextStep, IdxMessage } from '../../types';
import { IdxRemediation } from '../../types/idx-js';
import { getAllValues, getRequiredValues, titleCase } from '../util';

// A map from IDX data values (server spec) to RemediationValues (client spec)
export type IdxToRemediationValueMap = Record<string, string[]>;

export interface RemediationValues {
  stateHandle?: string;
  authenticators?: string[];
}

// Base class - DO NOT expose static remediationName
export class Remediator {
  static remediationName: string;

  remediation: IdxRemediation;
  values?: RemediationValues;
  map?: IdxToRemediationValueMap;

  constructor(remediation: IdxRemediation, values?: RemediationValues) {
    this.remediation = remediation;
    this.values = values;
  }

  getName(): string {
    return this.remediation.name;
  }

  // Override this method to provide custom check
  canRemediate(): boolean {
    if (!this.map) {
      return false;
    }
    const required = getRequiredValues(this.remediation);
    const needed = required.find((key) => !this.hasData(key));
    if (needed) {
      return false; // missing data for a required field
    }
    return true; // all required fields have available data
  }

  // returns an object for the entire remediation form, or just a part
  getData(key?: string) {

    if (!key) {
      let allValues = getAllValues(this.remediation);
      let res = allValues.reduce((data, key) => {
        data[key] = this.getData(key); // recursive
        return data;
      }, {});
      return res;
    }

    // Map value by "map${Property}" function in each subClass
    if (typeof this[`map${titleCase(key)}`] === 'function') {
      return this[`map${titleCase(key)}`](
        this.remediation.value.find(({name}) => name === key)
      );
    }

    if (!this.map) {
      return this.values[key];
    }

    // Handle general primitive types
    const entry = this.map[key];
    if (!entry) {
      return this.values[key];
    }

    // find the first aliased property that returns a truthy value
    for (let i = 0; i < entry.length; i++) {
      let val = this.values[entry[i]];
      if (val) {
        return val;
      }
    }
  }

  hasData(
    key: string // idx name
  ): boolean 
  {
    // no attempt to format, we want simple true/false

    // First see if the remediation has a mapping for this vale
    const data = this.getData(key);
    if (typeof data === 'object') {
      return !!Object.keys(data).find(key => !!data[key]);
    }
    return !!data;
  }

  getNextStep(): NextStep {
    const inputs = this.getInputs();
    return { name: this.remediation.name, inputs };
  }

  // Get inputs for the next step
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
      const { type } = inputFromRemediation;
      if (typeof this[`getInput${titleCase(key)}`] === 'function') {
        input = this[`getInput${titleCase(key)}`](inputFromRemediation);
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
          input = { ...inputFromRemediation, name };
        }
      } 

      if (!input) {
        throw new AuthSdkError(`Missing custom getInput${titleCase(key)} method in Remediator: ${this.getName()}`);
      }

      inputs.push(input);
      return inputs;
    }, []);
  }

  // Override this method to grab messages per remediation
  getMessages(): IdxMessage[] | undefined {
    return this.remediation.value[0]?.form?.value.reduce((messages, field) => {
      if (field.messages) {
        messages = [...messages, ...field.messages.value];
      }
      return messages;
    }, []);
  }

  // Prepare values for the next remediation
  getValues() {
    return this.values;
  }
}
