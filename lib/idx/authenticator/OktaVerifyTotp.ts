import { VerificationCodeAuthenticator } from './VerificationCodeAuthenticator';

export class OktaVerifyTotp extends VerificationCodeAuthenticator {
  mapCredentials(values) {
    return { totp: values.verificationCode };
  }
}
