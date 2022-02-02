import { Authenticator, Credentials } from './Authenticator';

export interface OktaPasswordInputValues {
  password?: string;
  credentials?: Credentials;
}

export class OktaPassword extends Authenticator<OktaPasswordInputValues> {
  canVerify(values: OktaPasswordInputValues) {
    return !!(values.credentials || values.password);
  }

  mapCredentials(values: OktaPasswordInputValues): Credentials {
    return values.credentials || { passcode: values.password };
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
