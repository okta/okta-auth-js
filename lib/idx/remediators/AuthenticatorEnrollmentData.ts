import { AuthenticatorData, AuthenticatorDataValues } from './Base/AuthenticatorData';
import { getAuthenticatorFromRemediation } from './util';
import { Authenticator } from '../types';

export type AuthenticatorEnrollmentDataValues =  AuthenticatorDataValues & {
  phoneNumber?: string;
}
export class AuthenticatorEnrollmentData extends AuthenticatorData {
  static remediationName = 'authenticator-enrollment-data';

  values: AuthenticatorEnrollmentDataValues;

  canRemediate() {
    const authenticator = this.getAuthenticatorFromValues();
    return !!(authenticator && authenticator.methodType && authenticator.phoneNumber);
  }

  mapAuthenticator() {
    const authenticatorFromValues = this.getAuthenticatorFromValues();
    const authenticatorFromRemediation = getAuthenticatorFromRemediation(this.remediation);
    return { 
      id: authenticatorFromRemediation.form.value
        .find(({ name }) => name === 'id').value,
      methodType: authenticatorFromValues.methodType,
      phoneNumber: authenticatorFromValues.phoneNumber,
    };
  }

  getInputAuthenticator() {
    return [
      { name: 'methodType', type: 'string' },
      { name: 'phoneNumber', type: 'string' },
    ];
  }

  protected generateAuthenticatorFromValues(): Authenticator {
    const type = this.getRelatesToType();
    const { methodType, phoneNumber } = this.values;
    return { type, methodType, phoneNumber };
  }

}
