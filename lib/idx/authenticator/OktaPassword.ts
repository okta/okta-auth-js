import { Authenticator, Credentials } from './Authenticator';

export interface OktaPasswordInputValues {
  password?: string;
  passcode?: string;
  credentials?: Credentials;
}

export class OktaPassword extends Authenticator<OktaPasswordInputValues> {
  canVerify(values: OktaPasswordInputValues) {
    return !!(values.credentials || values.password || values.passcode);
  }

  mapCredentials(values: OktaPasswordInputValues): Credentials | undefined {
    const { credentials, password, passcode } = values;
    if (!credentials && !password && !passcode) {
      return;
    }
    return credentials || { passcode: passcode || password };
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
