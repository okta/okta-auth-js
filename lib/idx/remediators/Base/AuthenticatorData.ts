import { Remediator } from './Remediator';

// Base class - DO NOT expose static remediationName
export class AuthenticatorData extends Remediator {

  map = {
    'authenticator': ['authenticator']
  };

  getNextStep() {
    const common = super.getNextStep();
    return {
      ...common,
      type: this.remediation.relatesTo.value.type,
    };
  }
}
