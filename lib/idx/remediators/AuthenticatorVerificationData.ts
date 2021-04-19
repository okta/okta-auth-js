import Base from './Base';

export default class AuthenticatorVerificationData extends Base {
  values: any; // TODO: add proper type

  map = {
    'authenticator': ['authenticator']
  };

  canRemediate() {
    // TODO: check if authenticator exist in values
    return this.remediation.value
      .some(({ name }) => name === 'authenticator');
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
}
