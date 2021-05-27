import { RemediationValues } from './Base/Remediator';
import { AuthenticatorData } from './Base/AuthenticatorData';

export interface AuthenticatorEnrollmentDataValues extends RemediationValues {
  authenticators?: string[];
  phoneNumber?: string;
}

export class AuthenticatorEnrollmentData extends AuthenticatorData {
  static remediationName = 'authenticator-enrollment-data';

  values: AuthenticatorEnrollmentDataValues;

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

  getValues(): AuthenticatorEnrollmentDataValues {
    return {};
  }
}
