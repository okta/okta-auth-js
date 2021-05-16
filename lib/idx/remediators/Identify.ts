import { Remediator, RemediationValues } from './Remediator';

export interface IdentifyValues extends RemediationValues {
  username?: string;
  password?: string;
}

export class Identify extends Remediator {
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
}
