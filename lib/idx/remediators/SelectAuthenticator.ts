import Base from './Base';
import { RegistrationRemediationValues } from '../types';

export default class SelectAuthenticator extends Base {
  values: RegistrationRemediationValues;
  map = {};

  getRequiredValues() {
    // authenticator is required to proceed
    return super.getRequiredValues().concat(this.remediation.value.map(v => v.name).filter(n => n == 'authenticator'));
  }

  mapAuthenticator(remediationValue: any) {
    const { authenticators } = this.values;
    let selectedOption;
    for (let authenticator of authenticators) {
      selectedOption = remediationValue.options
        .find(({ relatesTo }) => relatesTo.type === authenticator);
      if (selectedOption) {
        break;
      }
    }
    if (!selectedOption)
      return null;
    return {
      id: selectedOption.value.form.value.find(({ name }) => name === 'id').value
    };
  }
}