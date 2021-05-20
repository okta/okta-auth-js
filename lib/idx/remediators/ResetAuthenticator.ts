import { VerifyAuthenticator, VerifyAuthenticatorValues } from './Base/VerifyAuthenticator';

export type ResetAuthenticatorValues = VerifyAuthenticatorValues;

export class ResetAuthenticator extends VerifyAuthenticator {
  static remediationName = 'reset-authenticator';
  values: ResetAuthenticatorValues;
}
