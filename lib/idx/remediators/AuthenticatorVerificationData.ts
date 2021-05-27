import { RemediationValues } from './Base/Remediator';
import { AuthenticatorData } from './Base/AuthenticatorData';

export interface AuthenticatorVerificationDataValues extends RemediationValues {
  authenticators?: string[];
}

export class AuthenticatorVerificationData extends AuthenticatorData {
  static remediationName = 'authenticator-verification-data';

  values: AuthenticatorVerificationDataValues;

  canRemediate() {
    if (this.remediation.value.some(({ name }) => name === 'authenticator')) {
      const authenticatorType = this.remediation.relatesTo.value.type;
      return !!this.values.authenticators?.find(authenticator => authenticator === authenticatorType);
    }
    return false;
  }

  mapAuthenticator() {
    const authenticatorVal = this.remediation.value
      .find(({ name }) => name === 'authenticator').form.value;
    return { 
      id: authenticatorVal
        .find(({ name }) => name === 'id').value,
      enrollmentId: authenticatorVal
        .find(({ name }) => name === 'enrollmentId').value,
      methodType: 'sms',
    };
  }


  getValues(): AuthenticatorVerificationDataValues {
    return {};
  }
}
