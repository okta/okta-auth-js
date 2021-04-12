import Base from './Base';
import { RegistrationRemediationValues } from '../types';

export default class SelectAuthenticatorEnroll extends Base {
  values: RegistrationRemediationValues;
  map = {};

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
    return {
      id: selectedOption.value.form.value.find(({ name }) => name === 'id').value
    };
  }
}