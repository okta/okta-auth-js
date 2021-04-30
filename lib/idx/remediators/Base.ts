/* eslint-disable complexity */
import { AuthApiError } from '../../errors';
import { 
  IdxRemediation, 
  IdxToRemediationValueMap, 
  IdxResponse, 
  NextStep,
} from '../types';
import { getAllValues, getRequiredValues, titleCase } from '../util';

export interface RemediationValues {
  stateHandle?: string;
}

export class Base {
  remediation: IdxRemediation;
  values: RemediationValues;
  map?: IdxToRemediationValueMap;

  constructor(remediation: IdxRemediation, values: RemediationValues) {
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
    if (!this.map) {
      return {};
    }

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

    // Handle general primitive types
    const entry = this.map[key];
    if (!entry) {
      return;
    }

    if (typeof entry === 'string') {
      return this.values[entry];
    }

    if (!Array.isArray(entry) || entry.length === 0) {
      return this.values[key]; // return value unformatted
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
    if (!this.map || !this.map[key] || !Array.isArray(this.map[key])) {
      return !!this.values[key];
    }
    return !!(this.map[key] as string[]).find((alias) => {
      return this.values[alias]; 
    });
  }

  getNextStep(): NextStep {
    return { name: this.remediation.name };
  }

  // Override this method to extract error message from remediation form fields
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  getErrorMessages(errorRemediation: IdxResponse): string[] {
    return [];
  }

  createFormError(err) {
    const errorRemediation = err.remediation.value.find(({ name }) => name === this.remediation.name);
    const errors = this.getErrorMessages(errorRemediation);
    return new AuthApiError({
      errorSummary: errors.join('. '),
      errorCauses: errors
    });
  }

  // Prepare values for the next remediation
  getValues() {
    return this.values;
  }
}