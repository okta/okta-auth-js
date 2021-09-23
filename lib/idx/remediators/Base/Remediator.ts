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
import { NextStep, IdxMessage, Authenticator } from '../../types';
import { IdxRemediation } from '../../types/idx-js';
import { getAllValues, getRequiredValues, titleCase } from '../util';

// A map from IDX data values (server spec) to RemediationValues (client spec)
export type IdxToRemediationValueMap = Record<string, string[]>;

export interface RemediationValues {
  stateHandle?: string;
  authenticators?: Authenticator[] | string[];
}

// Base class - DO NOT expose static remediationName
export class Remediator {
  static remediationName: string;

  remediation: IdxRemediation;
  values: RemediationValues;
  map?: IdxToRemediationValueMap;

  constructor(remediation: IdxRemediation, values: RemediationValues = {}) {
    // map authenticators to Authenticator[] type
    values.authenticators = (values.authenticators?.map(authenticator => {
      return typeof authenticator === 'string' 
        ? { key: authenticator } : authenticator;
    }) || []) as Authenticator[];
    
    // assign fields to the instance
    this.values = values;
    this.remediation = remediation;
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
    const name = this.getName();
    const inputs = this.getInputs();
    const currentAuthenticator = this.getRelatesTo()?.value;
    return { 
      name, 
      inputs, 
      ...(currentAuthenticator && { currentAuthenticator }),
    };
  }

  // Get inputs for the next step
  private getInputs() {
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

      if (Array.isArray(input)) {
        input.forEach(i => inputs.push(i));
      } else {
        inputs.push(input);
      }
      return inputs;
    }, []);
  }

  // Override this method to grab messages per remediation
  getMessages(): IdxMessage[] | undefined {
    if (!this.remediation.value) {
      return;
    }
    return this.remediation.value[0]?.form?.value.reduce((messages, field) => {
      if (field.messages) {
        messages = [...messages, ...field.messages.value];
      }
      return messages;
    }, []);
  }

  // Prepare values for the next remediation
  // In general, remove finished authenticator from list
  getValuesAfterProceed() {
    const authenticatorType = this.getRelatesToType();
    const authenticators = (this.values.authenticators as Authenticator[])
      ?.filter(authenticator => authenticator.key !== authenticatorType);
    return { ...this.values, authenticators };
  }

  protected getRelatesToType() {
    return this.remediation.relatesTo?.value.type;
  }

  protected getRelatesTo(): IdxRemediation['relatesTo'] {
    return this.remediation.relatesTo;
  }

}
