import { Base, RemediationValues } from './Base';
import { IdxRemediation, IdxRemeditionValue } from '../types';
import { AuthSdkError } from '../../errors';

// Find matched authenticator in provided order
function findMatchedOption(authenticators, options) {
  let option;
  for (let authenticator of authenticators) {
    option = options
      .find(({ relatesTo }) => relatesTo.type === authenticator);
    if (option) {
      break;
    }
  }
  return option;
}

export interface SelectAuthenticatorValues extends RemediationValues {
  authenticators?: string[];
}

export class SelectAuthenticator extends Base {
  values: SelectAuthenticatorValues;
  remediationValue: IdxRemeditionValue;
  matchedOption: IdxRemediation;
  
  map = {
    authenticator: null // value here does not matter, fall to the custom map function
  }

  constructor(remediation: IdxRemediation, values: RemediationValues) {
    super(remediation, values);
    this.remediationValue = this.remediation.value.find(({ name }) => name === 'authenticator');
  }

  canRemediate() {
    const { authenticators } = this.values;
    const { options } = this.remediationValue;
    // Let users select authenticator if no input is provided
    if (!authenticators || !authenticators.length) {
      return false;
    }
    // Proceed with provided authenticators
    const matchedOption = findMatchedOption(authenticators, options);
    if (matchedOption) {
      return true;
    }
    // Terminate idx interaction if provided authenticators are not supported
    throw new AuthSdkError('Provided authenticators are not supported, please check your org configuration');
  }

  getNextStep() {
    const authenticators = this.remediationValue.options.map(option => {
      const { 
        label, 
        relatesTo: { type } 
      } = option;
      return { label, value: type };
    });
    return {
      name: this.remediation.name,
      authenticators,
    };
  }

  mapAuthenticator(remediationValue: IdxRemeditionValue) {
    const { authenticators } = this.values;
    const { options } = remediationValue;
    const selectedOption = findMatchedOption(authenticators, options);
    return {
      id: selectedOption?.value.form.value.find(({ name }) => name === 'id').value
    };
  }
}
