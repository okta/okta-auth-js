import Base from './Base';

export default class EnrollOrChallengeAuthenticator extends Base {
  values: any; // TODO: add proper type

  map = {
    'credentials': ['credentials', 'password', 'emailVerificationCode', 'verificationCode']
  };

  canRemediate() {
    if (this.values.emailVerificationCode && this.remediation.relatesTo.value.type === 'email') {
      return true;
    }
    if (this.values.verificationCode && this.remediation.relatesTo.value.type === 'phone') {
      return true;
    }
    if (this.values.password && this.remediation.relatesTo.value.type === 'password') {
      return true;
    }
    return false;
  }

  mapCredentials() {
    return { 
      passcode: this.values.emailVerificationCode 
        || this.values.verificationCode 
        || this.values.password
    };
  }

  getNextStep() {
    return {
      name: this.remediation.name,
      type: this.remediation.relatesTo.value.type,
    };
  }

  getErrorMessages(errorRemediation) {
    return errorRemediation.value[0].form.value.reduce((errors, field) => {
      if (field.messages) {
        errors.push(field.messages.value[0].message);
      }
      return errors;
    }, []);
  }
}
