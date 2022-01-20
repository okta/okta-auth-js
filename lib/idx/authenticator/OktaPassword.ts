import { Authenticator } from './Authenticator';

export interface OktaPasswordInputValues {
  password?: string;
}

export class OktaPassword extends Authenticator<OktaPasswordInputValues> {
  canVerify(values: OktaPasswordInputValues) {
    return !!values.password;
  }

  mapCredentials(values: OktaPasswordInputValues) {
    return { passcode: values.password };
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
