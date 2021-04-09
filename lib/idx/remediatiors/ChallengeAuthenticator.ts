import Base from './Base';
import { AuthenticationRemediationValues } from '../types';

export default class ChallengeAuthenticator extends Base {
  values: AuthenticationRemediationValues;

  map = {
    'credentials': ['credentials', 'password']
  };

  mapCredentials() {
    return { passcode: this.values.password };
  }
}
