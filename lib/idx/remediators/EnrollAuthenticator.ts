import { VerifyAuthenticator, VerifyAuthenticatorValues } from './Base/VerifyAuthenticator';

export type EnrollAuthenticatorValues = VerifyAuthenticatorValues;

export class EnrollAuthenticator extends VerifyAuthenticator {
  static remediationName = 'enroll-authenticator';
  values: EnrollAuthenticatorValues;
}
