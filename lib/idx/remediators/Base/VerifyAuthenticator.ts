import { Remediator, RemediationValues } from './Remediator';

export interface VerifyAuthenticatorValues extends RemediationValues {
  verificationCode?: string;
  password?: string;
}

// Base class - DO NOT expose static remediationName
export class VerifyAuthenticator extends Remediator {
  static remediationName = 'challenge-authenticator';

  values: VerifyAuthenticatorValues;

  map = {
    'credentials': []
  };

  canRemediate() {
    const challengeType = this.getRelatesToType();
    if (this.values.verificationCode 
        && ['email', 'phone'].includes(challengeType)) {
      return true;
    }
    if (this.values.password && challengeType === 'password') {
      return true;
    }
    return false;
  }

  mapCredentials() {
    return { 
      passcode: this.values.verificationCode || this.values.password
    };
  }

  getInputCredentials(input) {
    const challengeType = this.getRelatesToType();
    const name = challengeType === 'password' ? 'password' : 'verificationCode';
    return {
      ...input.form.value[0],
      name,
      type: 'string',
      required: input.required
    };
  }

}
