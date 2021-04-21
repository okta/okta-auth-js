import { Base, RemediationValues } from './Base';
import { IdxRemeditionValue } from '../types';

export interface SelectAuthenticatorValues extends RemediationValues {
  authenticators: string[];
}

export class SelectAuthenticator extends Base {
  values: SelectAuthenticatorValues;
  map = {};

  mapAuthenticator(remediationValue: IdxRemeditionValue) {
    const { authenticators } = this.values;
    let selectedOption;
    for (let authenticator of authenticators) {
      selectedOption = remediationValue.options
        .find(({ relatesTo }) => relatesTo.type === authenticator);
      if (selectedOption) {
        break;
      }
    }
    return {
      id: selectedOption.value.form.value.find(({ name }) => name === 'id').value
    };
  }
}