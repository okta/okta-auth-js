import Base from './Base';

export default class Identify extends Base {
  map = {
    'identifier': ['identifier', 'username'],
    'credentials': ['credentials', 'password']
  };

  formatValue(key: string) {
    if (key === 'password' && this.values.password) {
      return { passcode: this.values.password };
    }
    return super.formatValue(key);
  }
}