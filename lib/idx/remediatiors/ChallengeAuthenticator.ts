import Base from './Base';

export default class ChallengeAuthenticator extends Base {
  map = {
    'credentials': ['credentials', 'password']
  };

  mapCredentials() {
    return { passcode: this.values.password };
  }
}
