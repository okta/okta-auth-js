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
import { IdxRemediationValue, IdxContext, IdxOption } from '../../types/idx-js';
import { Authenticator, isAuthenticator } from '../../types/api';
import { compareAuthenticators, findMatchedOption} from '../../authenticator/util';

export type SelectAuthenticatorValues = RemediationValues & {
  authenticator?: string | Authenticator;
};

// Base class - DO NOT expose static remediationName
export class SelectAuthenticator<T extends SelectAuthenticatorValues = SelectAuthenticatorValues>
  extends Remediator<T> {
  selectedAuthenticator?: Authenticator;
  selectedOption?: any;

  // Find matched authenticator in provided order
  findMatchedOption(authenticators, options) {
    let option: IdxOption | undefined;
    for (let authenticator of authenticators) {
      option = options
        .find(({ relatesTo }) => relatesTo.key && relatesTo.key === authenticator.key);
      if (option) {
        break;
      }
    }
    return option;
  }

  /* eslint complexity:[0,9] */
  canRemediate(context?: IdxContext) {
    const { authenticators, authenticator } = this.values;
    const authenticatorFromRemediation = getAuthenticatorFromRemediation(this.remediation);
    const { options } = authenticatorFromRemediation;
    // Let users select authenticator if no input is provided
    if (!authenticators || !authenticators.length) {
      return false;
    }

    // Authenticator is explicitly specified by id
    if (isAuthenticator(authenticator) && authenticator.id) {
      return true;
    }

    // Proceed with provided authenticators
    const matchedOption = this.findMatchedOption(authenticators, options!);
    if (matchedOption) {
      // Don't select current authenticator (OKTA-612939)
      const isCurrentAuthenticator = context?.currentAuthenticator
        && context?.currentAuthenticator.value.id === matchedOption.relatesTo?.id;
      const isCurrentAuthenticatorEnrollment = context?.currentAuthenticatorEnrollment
        && context?.currentAuthenticatorEnrollment.value.id === matchedOption.relatesTo?.id;
      return !isCurrentAuthenticator && !isCurrentAuthenticatorEnrollment;
    }
    
    return false;
  }

  mapAuthenticator(remediationValue: IdxRemediationValue) {
    const { authenticators, authenticator } = this.values;

    // Authenticator is explicitly specified by id
    if (isAuthenticator(authenticator) && authenticator.id) {
      this.selectedAuthenticator = authenticator; // track the selected authenticator
      return authenticator;
    }

    const { options } = remediationValue;
    const selectedOption = findMatchedOption(authenticators, options);
    this.selectedAuthenticator = selectedOption.relatesTo; // track the selected authenticator
    this.selectedOption = selectedOption;
    return {
      id: selectedOption?.value.form.value.find(({ name }) => name === 'id').value
    };
  }

  getInputAuthenticator(remediation) {
    const options = remediation.options.map(({ label, relatesTo }) => {
      return {
        label,
        value: relatesTo.key
      };
    });
    return { name: 'authenticator', type: 'string', options };
  }

  getValuesAfterProceed(): T {
    this.values = super.getValuesAfterProceed();
    // remove used authenticators
    const authenticators = (this.values.authenticators as Authenticator[])
      .filter(authenticator => {
        return compareAuthenticators(authenticator, this.selectedAuthenticator) !== true;
      });
    return { ...this.values, authenticators };
  }

}
