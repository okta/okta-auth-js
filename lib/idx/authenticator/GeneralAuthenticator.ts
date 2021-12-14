import { Authenticator } from './Authenticator';

export type GeneralAuthenticatorInputValues = {
  verificationCode: string;
};

export class GeneralAuthenticator extends Authenticator {
  canVerify(values) {
    return !!values.verificationCode;
  }

  mapCredentials(values) {
    return { passcode: values.verificationCode };
  }

  getInputs(idxRemediationValue) {
    return {
      ...idxRemediationValue.form?.value[0],
      name: 'verificationCode',
      type: 'string',
      required: idxRemediationValue.required
    };
  }
}
