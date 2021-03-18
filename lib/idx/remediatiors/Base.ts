/* eslint-disable complexity */
import { RemediationValues, IdxRemediation, IdxToRemediationValueMap } from '../types';
import { getRequiredValues } from '../util';

export default class Base {
  remediation: IdxRemediation;
  values: RemediationValues;
  map?: IdxToRemediationValueMap;

  constructor(remediation: IdxRemediation, values: RemediationValues) {
    this.remediation = remediation;
    this.values = values;
  }

  canRemediate() {
    if (!this.map) {
      return false;
    }
    const required = getRequiredValues(this.remediation);
    const needed = required.find((key) => {
      if (!this.hasData(key)) {
        return key;
      }
    });
    if (needed) {
      console.log(`Missing value for required field: "${needed}"`);
      return false; // missing data for a required field
    }
    return true; // all required fields have available data
  }

  // returns an object for the entire remediation form, or just a part
  getData(key: string) {
    if (!this.map) {
      return {};
    }

    if (!key) {
      let res = Object.keys(this.map).reduce((data, key) => {
        data[key] = this.getData(key); // recursive
        return data;
      }, {});
      return res;
    }

    const entry = this.map[key];
    if (!entry) {
      return;
    }

    if (typeof entry === 'string') {
      return this.formatValue(entry);
    }

    if (!Array.isArray(entry) || entry.length === 0) {
      return this.values[key]; // return value unformatted
    }

    // find the first aliased property that returns a truthy value
    for (let i = 0; i < entry.length; i++) {
      let val = this.formatValue(entry[i]);
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

  
  // only handles primitive types
  formatValue(key: string) {
    return this.values[key];
  }
}