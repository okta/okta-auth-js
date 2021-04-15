import Base from './Base';
import { RegistrationRemediationValues } from '../types';

export default class EnrollOrChallengeAuthenticator extends Base {
  values: RegistrationRemediationValues;

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
