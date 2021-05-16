import { Remediator, RemediationValues } from './Remediator';
import { IdxRemediation, IdxRemediationValue } from '../types';
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

export class SelectAuthenticator extends Remediator {
  values: SelectAuthenticatorValues;
  remediationValue: IdxRemediationValue;
  matchedOption: IdxRemediation;
  
  selectedAuthenticator: string;
  
  map = {
    authenticator: []
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
    const common = super.getNextStep();
    const authenticators = this.remediationValue.options.map(option => {
      const { 
        label, 
        relatesTo: { type } 
      } = option;
      return { label, value: type };
    });
    return {
      ...common,
      authenticators,
    };
  }

  mapAuthenticator(remediationValue: IdxRemediationValue) {
    const { authenticators } = this.values;
    const { options } = remediationValue;
    const selectedOption = findMatchedOption(authenticators, options);
    this.selectedAuthenticator = selectedOption?.relatesTo.type;
    return {
      id: selectedOption?.value.form.value.find(({ name }) => name === 'id').value
    };
  }

  getValues(): SelectAuthenticatorValues {
    const authenticators = this.values.authenticators
      .filter(authenticator => authenticator !== this.selectedAuthenticator);
    return { ...this.values, authenticators };
  }
}
