import { Authenticator, Credentials } from './Authenticator';

export interface OktaPasswordInputValues {
  password?: string;
  passcode?: string;
  credentials?: Credentials;
  // for ResetAuthenticator
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
    const inputs = [{
      ...idxRemediationValue.form?.value[0],
      name: 'password',
      type: 'string',
      required: idxRemediationValue.required,
    }];
    const revokeSessions = idxRemediationValue.form?.value.find(
      input => input.name === 'revokeSessions'
    );
    if (revokeSessions) {
      inputs.push({
        name: 'revokeSessions',
        type: 'boolean',
        label: 'Sign me out of all other devices',
        required: false,
      });
    }
    return inputs;
  }
}
