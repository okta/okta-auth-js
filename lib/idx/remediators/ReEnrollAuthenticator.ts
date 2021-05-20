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

  getNextStep() {
    const common = super.getNextStep();
    return {
      ...common,
      type: this.remediation.relatesTo.value.type,
    };
  }
}
