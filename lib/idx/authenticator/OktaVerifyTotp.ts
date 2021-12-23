import { Credentials } from './Authenticator';
import { VerificationCodeAuthenticator } from './VerificationCodeAuthenticator';

interface TotpCredentials extends Credentials {
  totp: string;
}

export class OktaVerifyTotp extends VerificationCodeAuthenticator {
  mapCredentials(values): TotpCredentials {
    return { totp: values.verificationCode };
  }
}
