import { Remediator, RemediationValues } from './Base/Remediator';

export interface IdentifyValues extends RemediationValues {
  username?: string;
  password?: string;
}

export class Identify extends Remediator {
  static remediationName = 'identify';

  values: IdentifyValues;

  map = {
    'identifier': ['username'],
    'credentials': []
  };

  canRemediate() {
    const { identifier } = this.getData();
    return !!identifier;
  }

  mapCredentials() {
    return { passcode: this.values.password };
  }

  getInputCredentials(input) {
    return {
      ...input.form.value[0],
      name: 'password',
      required: input.required
    };
  }

  getValues() {
    if (this.remediation.value.some(({ name }) => name === 'credentials')) {
      // remove "password" from authenticator array when remediation is finished
      const authenticators = this.values.authenticators?.filter(authenticator => authenticator !== 'password');
      return { ...this.values, authenticators };
    }
    
    return super.getValues();
  }
}
