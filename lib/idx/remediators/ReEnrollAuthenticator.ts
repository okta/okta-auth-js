import { Remediator, RemediationValues } from './Base/Remediator';

export interface ReEnrollAuthenticatorValues extends RemediationValues {
  newPassword?: string;
}

export class ReEnrollAuthenticator extends Remediator {
  static remediationName = 'reenroll-authenticator';

  values: ReEnrollAuthenticatorValues;

  map = {
    'credentials': []
  };

  mapCredentials() {
    return { 
      passcode: this.values.newPassword,
    };
  }

  getInputCredentials(input) {
    const challengeType = this.getRelatesToType();
    const name = challengeType === 'password' ? 'newPassword' : 'verificationCode';
    return {
      ...input.form.value[0],
      name
    };
  }

}
