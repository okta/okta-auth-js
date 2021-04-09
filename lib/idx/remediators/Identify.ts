import Base from './Base';
import { AuthenticationRemediationValues } from '../types';

export default class Identify extends Base {
  values: AuthenticationRemediationValues;

  map = {
    'identifier': ['identifier', 'username'],
    'credentials': ['credentials', 'password']
  };

  mapCredentials() {
    return { passcode: this.values.password };
  }
}
