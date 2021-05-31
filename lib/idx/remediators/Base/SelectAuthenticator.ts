import { Remediator, RemediationValues } from './Remediator';
import { getAuthenticatorFromRemediation } from '../util';
import { IdxRemediation, IdxRemediationValue } from '../../types/idx-js';
import { Authenticator } from '../../types';

// Find matched authenticator in provided order
function findMatchedOption(authenticators, options) {
  let option;
  for (let authenticator of authenticators) {
    option = options
      .find(({ relatesTo }) => relatesTo.type === authenticator.type);
    if (option) {
      break;
    }
  }
  return option;
}

export type SelectAuthenticatorValues = RemediationValues & {
  authenticator?: string;
};

// Base class - DO NOT expose static remediationName
export class SelectAuthenticator extends Remediator {
  values: SelectAuthenticatorValues;
  matchedOption: IdxRemediation;
  
  map = {
    authenticator: []
  }

  constructor(remediation: IdxRemediation, values: SelectAuthenticatorValues = {}) {
    super(remediation, values);
    
    // Unify authenticator input type
    const { authenticator: selectedAuthenticator, authenticators } = this.values;
    const hasSelectedAuthenticatorInList = authenticators
        ?.some((authenticator => authenticator.type === selectedAuthenticator));
    if (selectedAuthenticator && !hasSelectedAuthenticatorInList) {
      // add selected authenticator to list
      this.values.authenticators = [
        ...(authenticators || []), 
        { type: selectedAuthenticator }
      ] as Authenticator[];
    }
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
    const matchedOption = findMatchedOption(authenticators, options);
    if (matchedOption) {
      return true;
    }
    
    return false;
  }

  getNextStep() {
    const common = super.getNextStep();
    const authenticatorFromRemediation = getAuthenticatorFromRemediation(this.remediation);
    const options = authenticatorFromRemediation.options.map(option => {
      const { 
        label, 
        relatesTo: { type } 
      } = option;
      return { label, value: type };
    });
    return { ...common, options };
  }

  mapAuthenticator(remediationValue: IdxRemediationValue) {
    const { authenticators } = this.values;
    const { options } = remediationValue;
    const selectedOption = findMatchedOption(authenticators, options);
    return {
      id: selectedOption?.value.form.value.find(({ name }) => name === 'id').value
    };
  }

  getInputAuthenticator() {
    return { name: 'authenticator', type: 'string' };
  }

}
