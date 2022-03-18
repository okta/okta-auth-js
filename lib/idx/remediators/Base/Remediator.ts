/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import { NextStep, IdxMessage, Authenticator, Input, IdxOptions, RemediateOptions } from '../../types';
import { IdxAuthenticator, IdxRemediation, IdxContext } from '../../types/idx-js';
import { getAllValues, getRequiredValues, titleCase, getAuthenticatorFromRemediation } from '../util';
import { formatAuthenticator, compareAuthenticators } from '../../authenticator/util';

// A map from IDX data values (server spec) to RemediationValues (client spec)
export type IdxToRemediationValueMap = Record<string, string[]>;

export interface RemediationValues extends IdxOptions {
  stateHandle?: string;
  authenticators?: (Authenticator | string)[];
  authenticator?: string | Authenticator;
  authenticatorsData?: Authenticator[];
}

// Base class - DO NOT expose static remediationName
export class Remediator {
  static remediationName: string;

  remediation: IdxRemediation;
  values: RemediationValues;
  options: RemediateOptions;
  map?: IdxToRemediationValueMap;

  constructor(remediation: IdxRemediation, values: RemediationValues = {}, options: RemediateOptions = {}) {
    // assign fields to the instance
    this.values = { ...values };
    this.options = { ...options };
    this.formatAuthenticators();
    this.remediation = remediation;
  }

  private formatAuthenticators() {
    this.values.authenticators = (this.values.authenticators || []) as Authenticator[];

    // ensure authenticators are in the correct format
    this.values.authenticators = this.values.authenticators.map(authenticator => {
      return formatAuthenticator(authenticator);
    });

    // add authenticator (if any) to "authenticators"
    if (this.values.authenticator) {
      const authenticator = formatAuthenticator(this.values.authenticator);
      const hasAuthenticatorInList = this.values.authenticators.some(existing => {
        return compareAuthenticators(authenticator, existing);
      });
      if (!hasAuthenticatorInList) {
        this.values.authenticators.push(authenticator);
      }
    }

    // save non-key meta to "authenticatorsData" field
    // authenticators will be removed after selection to avoid select-authenticator loop
    this.values.authenticatorsData = this.values.authenticators.reduce((acc, authenticator) => {
      if (typeof authenticator === 'object' && Object.keys(authenticator).length > 1) {
        // save authenticator meta into authenticator data
        acc.push(authenticator);
      }
      return acc;
    }, this.values.authenticatorsData || []);
  }

  getName(): string {
    return this.remediation.name;
  }

  // Override this method to provide custom check
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  canRemediate(): boolean {
    const required = getRequiredValues(this.remediation);
    const needed = required!.find((key) => !this.hasData(key));
    if (needed) {
      return false; // missing data for a required field
    }
    return true; // all required fields have available data
  }

  // returns an object for the entire remediation form, or just a part
  getData(key?: string) {

    if (!key) {
      let allValues = getAllValues(this.remediation);
      let res = allValues!.reduce((data, key) => {
        data[key] = this.getData(key); // recursive
        return data;
      }, {});
      return res;
    }

    // Map value by "map${Property}" function in each subClass
    if (typeof this[`map${titleCase(key)}`] === 'function') {
      const val = this[`map${titleCase(key)}`](
        this.remediation.value!.find(({name}) => name === key)
      );
      if (val) {
        return val;
      }
    }

    // If a map is defined for this key, return the first aliased property that returns a truthy value
    if (this.map && this.map[key]) {
      const entry = this.map[key];
      for (let i = 0; i < entry.length; i++) {
        let val = this.values[entry[i]];
        if (val) {
          return val;
        }
      }
    }

    // fallback: return the value by key
    return this.values[key];
  }

  hasData(
    key: string // idx name
  ): boolean 
  {
    // no attempt to format, we want simple true/false
    return !!this.getData(key);
  }

  getNextStep(_context?: IdxContext): NextStep {
    const name = this.getName();
    const inputs = this.getInputs();
    const authenticator = this.getAuthenticator();
    // TODO: remove type field in the next major version change
    // https://oktainc.atlassian.net/browse/OKTA-431749
    const type = authenticator?.type;
    return { 
      name, 
      inputs, 
      ...(type && { type }),
      ...(authenticator && { authenticator }),
    };
  }

  // Get inputs for the next step
  private getInputs(): Input[] {
    const inputs = [];
    const inputsFromRemediation = this.remediation.value || [];
    inputsFromRemediation.map(inputFromRemediation => {
      let input;
      let { name, type } = inputFromRemediation;
      if (typeof this[`getInput${titleCase(name)}`] === 'function') {
        input = this[`getInput${titleCase(name)}`](inputFromRemediation);
      } else if (type !== 'object') {
        // handle general primitive types
        let alias;
        const aliases = (this.map ? this.map[name] : null) || [];
        if (aliases.length === 1) {
          alias = aliases[0];
        } else {
          // try find key from values
          alias = aliases.find(name => Object.keys(this.values).includes(name));
        }
        if (alias) {
          input = { ...inputFromRemediation, name: alias };
        }
      }
      if (!input) {
        input = inputFromRemediation;
        // throw new AuthSdkError(`Missing custom getInput${titleCase(name)} method in Remediator: ${this.getName()}`);
      }
      if (Array.isArray(input)) {
        input.forEach(i => inputs.push(i as never));
      } else {
        inputs.push(input as never);
      }
    });
    return inputs;
  }

  static getMessages(remediation: IdxRemediation): IdxMessage[] | undefined {
    if (!remediation.value) {
      return;
    }
    return remediation.value[0]?.form?.value.reduce((messages, field) => {
      if (field.messages) {
        messages = [...messages, ...field.messages.value] as never;
      }
      return messages;
    }, []);
  }

  // Prepare values for the next remediation
  // In general, remove used values from inputs for the current remediation
  // Override this method if special cases need be handled
  getValuesAfterProceed(): RemediationValues {
    const inputs = this.getInputs();
    for (const input of inputs) {
      delete this.values[input.name];
    }
    return this.values;
  }

  protected getAuthenticator(): IdxAuthenticator | undefined {
    // relatesTo value may be an authenticator or an authenticatorEnrollment
    const relatesTo = this.remediation.relatesTo?.value;
    if (!relatesTo) {
      return;
    }

    const authenticatorFromRemediation = getAuthenticatorFromRemediation(this.remediation);
    if (!authenticatorFromRemediation) {
      // Hopefully value is an authenticator
      return relatesTo;
    }

    // If relatesTo is an authenticatorEnrollment, the id is actually the enrollmentId
    // Let's get the correct authenticator id from the form value
    const id = authenticatorFromRemediation.form!.value
      .find(({ name }) => name === 'id')!.value as string;
    const enrollmentId = authenticatorFromRemediation.form!.value
      .find(({ name }) => name === 'enrollmentId')?.value as string;

    return {
      ...relatesTo,
      id,
      enrollmentId
    };
  }
}
