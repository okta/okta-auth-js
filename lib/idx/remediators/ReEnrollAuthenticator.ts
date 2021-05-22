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

  private getChallengeType() {
    return this.remediation.relatesTo.value.type;
  }

  mapCredentials() {
    return { 
      passcode: this.values.newPassword,
    };
  }

  getInputCredentials(input) {
    const challengeType = this.getChallengeType();
    const name = challengeType === 'password' ? 'newPassword' : 'verificationCode';
    return {
      ...input.form.value[0],
      name
    };
  }

  getNextStep() {
    const common = super.getNextStep();
    return {
      ...common,
      type: this.remediation.relatesTo.value.type,
    };
  }
}
