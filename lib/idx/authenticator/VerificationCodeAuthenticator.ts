import { Authenticator, Credentials } from './Authenticator';

interface VerificationCodeCredentials extends Credentials {
  passcode: string;
}

// general authenticator to handle "verificationCode" input
// it can be used for "email", "phone", "google authenticator"
// a new authenticator class should be created if special cases need to be handled
export class VerificationCodeAuthenticator extends Authenticator {
  canVerify(values) {
    return (values.verificationCode || values.otp);
  }

  mapCredentials(values): VerificationCodeCredentials | Credentials {
    return { passcode: values.verificationCode || values.otp };
  }

  getInputs(idxRemediationValue) {
    return {
      ...idxRemediationValue.form?.value[0],
      name: 'verificationCode',
      type: 'string',
      required: idxRemediationValue.required
    };
  }
}
