import { Base, RemediationValues } from './Base';

export interface IdentifyValues extends RemediationValues {
  username?: string;
  password?: string;
}

export class Identify extends Base {
  values: IdentifyValues;

  map = {
    'identifier': ['identifier', 'username'],
    'credentials': ['credentials', 'password']
  };

  mapCredentials() {
    return { passcode: this.values.password };
  }
}
