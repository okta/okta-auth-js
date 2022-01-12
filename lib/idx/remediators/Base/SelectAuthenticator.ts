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


import { Remediator, RemediationValues } from './Remediator';
import { getAuthenticatorFromRemediation } from '../util';
import { IdxAuthenticator, IdxOption, IdxRemediationValue } from '../../types/idx-js';
import { Authenticator } from '../../types';


export type SelectAuthenticatorValues = RemediationValues & {
  authenticator?: string;
  methodType?: string;
};

// Base class - DO NOT expose static remediationName
export class SelectAuthenticator extends Remediator {
  values!: SelectAuthenticatorValues;
  selectedAuthenticator?: IdxAuthenticator;
  selectedOption?: any;
  
  map = {
    authenticator: []
  }

  // Find matched authenticator in provided order
  findMatchedOption(authenticators, options) {
    let option;
    for (let authenticator of authenticators) {
      option = options
        .find(({ relatesTo }) => relatesTo.key === authenticator.key);
      if (option) {
        break;
      }
    }
    return option;
  }

  canRemediate() {
    const { authenticators } = this.values;
    const authenticatorFromRemediation = getAuthenticatorFromRemediation(this.remediation);
    const { options } = authenticatorFromRemediation;
    // Let users select authenticator if no input is provided
    if (!authenticators || !authenticators.length) {
      return false;
    }
    // Proceed with provided authenticators
    const matchedOption = this.findMatchedOption(authenticators, options);
    if (matchedOption) {
      return true;
    }
    
    return false;
  }

  getNextStep() {
    const common = super.getNextStep();
    const authenticatorFromRemediation = getAuthenticatorFromRemediation(this.remediation);
    const options = authenticatorFromRemediation.options!.map(option => {
      const { 
        label, 
        relatesTo
      } = option as IdxOption;
      const key = relatesTo!.key!;
      return { label, value: key };
    });
    return { ...common, options };
  }

  mapAuthenticator(remediationValue: IdxRemediationValue) {
    const { authenticators } = this.values;
    const { options } = remediationValue;
    const selectedOption = this.findMatchedOption(authenticators, options);
    // track the selected authenticator
    this.selectedAuthenticator = selectedOption.relatesTo;
    this.selectedOption = selectedOption;
    return {
      id: selectedOption?.value.form.value.find(({ name }) => name === 'id').value
    };
  }

  getInputAuthenticator() {
    return { name: 'authenticator', key: 'string' };
  }

  getValuesAfterProceed(): RemediationValues {
    this.values = super.getValuesAfterProceed();
    // remove used authenticators
    const authenticators = (this.values.authenticators as Authenticator[])
      .filter(authenticator => {
        return authenticator.key !== this.selectedAuthenticator!.key; 
      });
    return { ...this.values, authenticators };
  }

}
