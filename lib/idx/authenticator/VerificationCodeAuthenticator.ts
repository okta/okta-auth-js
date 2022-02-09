import { Authenticator, Credentials } from './Authenticator';

export interface VerificationCodeValues {
  verificationCode?: string;
  otp?: string;
  credentials?: Credentials;
}

interface VerificationCodeCredentials extends Credentials {
  passcode: string;
}

// general authenticator to handle "verificationCode" input
// it can be used for "email", "phone", "google authenticator"
// a new authenticator class should be created if special cases need to be handled
export class VerificationCodeAuthenticator extends Authenticator<VerificationCodeValues> {
  canVerify(values: VerificationCodeValues) {
    return !!(values.credentials ||values.verificationCode || values.otp);
  }

  mapCredentials(values): VerificationCodeCredentials | Credentials | undefined {
    const { credentials, verificationCode, otp } = values;
    if (!credentials && !verificationCode && !otp) {
      return;
    }
    return credentials || { passcode: verificationCode || otp };
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
