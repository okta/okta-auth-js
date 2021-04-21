import { Base, RemediationValues } from './Base';

export interface EnrollOrChallengeAuthenticatorValues extends RemediationValues {
  verificationCode?: string;
  password?: string;
}

export class EnrollOrChallengeAuthenticator extends Base {
  values: EnrollOrChallengeAuthenticatorValues;

  map = {
    'credentials': ['password', 'verificationCode']
  };

  canRemediate() {
    if (this.values.verificationCode 
        && ['email', 'phone'].includes(this.remediation.relatesTo.value.type)) {
      return true;
    }
    if (this.values.password 
        && this.remediation.relatesTo.value.type === 'password') {
      return true;
    }
    return false;
  }

  mapCredentials() {
    return { 
      passcode: this.values.verificationCode || this.values.password
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
