import Base from './Base';

export default class EnrollAuthenticator extends Base {
  map = {
    'credentials': ['credentials', 'password', 'emailVerificationCode']
  };

  canRemediate() {
    if (this.values.emailVerificationCode && this.remediation.relatesTo.value.type === 'email') {
      return true;
    }
    if (this.values.password && this.remediation.relatesTo.value.type === 'password') {
      return true;
    }
    return false;
  }

  mapCredentials() {
    return { 
      passcode: this.values.emailVerificationCode || this.values.password 
    };
  }
}
