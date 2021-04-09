import Base from './Base';

export default class Identify extends Base {
  map = {
    'identifier': ['identifier', 'username'],
    'credentials': ['credentials', 'password']
  };

  mapCredentials() {
    return { passcode: this.values.password };
  }
}
