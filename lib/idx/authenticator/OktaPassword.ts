import { Authenticator, Credentials } from './Authenticator';

export interface OktaPasswordInputValues {
  password?: string;
  passcode?: string;
  credentials?: Credentials;
  revokeSessions?: boolean;
}

export class OktaPassword extends Authenticator<OktaPasswordInputValues> {
  canVerify(values: OktaPasswordInputValues) {
    return !!(values.credentials || values.password || values.passcode);
  }

  mapCredentials(values: OktaPasswordInputValues): Credentials | undefined {
    const { credentials, password, passcode, revokeSessions } = values;
    if (!credentials && !password && !passcode) {
      return;
    }
    return credentials || {
      passcode: passcode || password,
      revokeSessions,
    };
  }

  getInputs(idxRemediationValue) {
    return [{
      ...idxRemediationValue.form?.value[0],
      name: 'password',
      type: 'string',
      required: idxRemediationValue.required,
    }];
  }
}
