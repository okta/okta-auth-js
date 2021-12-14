import { Authenticator } from './Authenticator';

export type OktaPasswordInputValues = {
  password: string;
};

export class OktaPassword extends Authenticator {
  canVerify(values) {
    return !!values.password;
  }

  mapCredentials(values) {
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
