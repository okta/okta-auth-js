import { VerifyAuthenticator, VerifyAuthenticatorValues } from './Base/VerifyAuthenticator';

export type ChallengeAuthenticatorValues = VerifyAuthenticatorValues;

export class ChallengeAuthenticator extends VerifyAuthenticator {
  static remediationName = 'challenge-authenticator';
  values: ChallengeAuthenticatorValues;
}
