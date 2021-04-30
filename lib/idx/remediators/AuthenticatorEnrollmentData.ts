import { Base, RemediationValues } from './Base';

export interface AuthenticatorEnrollmentDataValues extends RemediationValues {
  authenticators?: string[];
  phoneNumber?: string;
}

export class AuthenticatorEnrollmentData extends Base {
  values: AuthenticatorEnrollmentDataValues;

  map = {
    'authenticator': ['authenticator']
  };

  canRemediate() {
    return this.remediation.value.some(({ name }) => name === 'authenticator') 
      && !!this.values.phoneNumber;
  }

  mapAuthenticator() {
    const authenticatorVal = this.remediation.value
      .find(({ name }) => name === 'authenticator').form.value;
    return { 
      id: authenticatorVal
        .find(({ name }) => name === 'id').value,
      methodType: 'sms',
      phoneNumber: this.values.phoneNumber,
    };
  }

  getNextStep() {
    return {
      name: this.remediation.name,
      type: this.remediation.relatesTo.value.type,
    };
  }

  getValues(): AuthenticatorEnrollmentDataValues {
    return {};
  }
}
