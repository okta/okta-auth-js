import { Remediator, RemediationValues } from './Remediator';

export interface ReEnrollAuthenticatorValues extends RemediationValues {
  newPassword?: string;
}

export class ReEnrollAuthenticator extends Remediator {
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
