import Base from './Base';

export default class ChallengeAuthenticator extends Base {
  map = {
    'credentials': ['credentials', 'password']
  };

  formatValue(key: string) {
    if (key === 'password' && this.values.password) {
      return { passcode: this.values.password };
    }
    return super.formatValue(key);
  }
}
