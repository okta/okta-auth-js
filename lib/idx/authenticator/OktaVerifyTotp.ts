import { Credentials } from './Authenticator';
import { VerificationCodeAuthenticator } from './VerificationCodeAuthenticator';

interface TotpCredentials extends Credentials {
  totp: string;
}

export class OktaVerifyTotp extends VerificationCodeAuthenticator {
  mapCredentials(values): TotpCredentials | undefined {
    const { verificationCode } = values;
    if (!verificationCode) {
      return;
    }
    return { totp: verificationCode };
  }
}
