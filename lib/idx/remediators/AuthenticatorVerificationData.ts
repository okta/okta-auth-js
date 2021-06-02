import { AuthenticatorData, AuthenticatorDataValues } from './Base/AuthenticatorData';

export type AuthenticatorVerificationDataValues = AuthenticatorDataValues;

export class AuthenticatorVerificationData extends AuthenticatorData {
  static remediationName = 'authenticator-verification-data';

  values: AuthenticatorVerificationDataValues;

  canRemediate() {
    const authenticator = this.getAuthenticatorFromValues();
    return !!(authenticator && authenticator.methodType);
  }

  mapAuthenticator() {
    const authenticatorFromRemediation = this.getAuthenticatorFromRemediation();
    const authenticatorFromValues = this.getAuthenticatorFromValues();
    return { 
      id: authenticatorFromRemediation.form.value
        .find(({ name }) => name === 'id').value,
      enrollmentId: authenticatorFromRemediation.form.value
        .find(({ name }) => name === 'enrollmentId').value,
      methodType: authenticatorFromValues.methodType,
    };
  }

  getInputAuthenticator() {
    const authenticator = this.getAuthenticatorFromRemediation();
    const methodType = authenticator.form.value.find(({ name }) => name === 'methodType');
    // if has methodType in form, let user select the methodType
    if (methodType && methodType.options) {
      return { name: 'methodType', type: 'string', required: true };
    }
    // no methodType, then return form values
    const inputs = [...authenticator.form.value];
    return inputs;
  }

}
