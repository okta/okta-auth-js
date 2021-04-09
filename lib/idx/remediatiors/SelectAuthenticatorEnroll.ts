import Base from './Base';

export default class SelectAuthenticatorEnroll extends Base {
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