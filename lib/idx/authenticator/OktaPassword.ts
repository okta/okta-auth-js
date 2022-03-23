import { Authenticator, Credentials } from './Authenticator';

export interface OktaPasswordInputValues {
  password?: string;
  credentials?: Credentials;
}

export class OktaPassword extends Authenticator<OktaPasswordInputValues> {
  canVerify(values: OktaPasswordInputValues) {
    return !!(values.credentials || values.password);
  }

  mapCredentials(values: OktaPasswordInputValues): Credentials | undefined {
    const { credentials, password } = values;
    if (!credentials && !password) {
      return;
    }
    return credentials || { passcode: password };
  }

  getInputs(idxRemediationValue) {
    return {
      ...idxRemediationValue.form?.value[0],
      name: 'password',
      type: 'string',
      required: idxRemediationValue.required
    };
  }
}
