import { AuthTransaction } from '../tx';
import { 
  OktaAuth, 
  IdxOptions, 
  RemediationFlow,
} from '../types';
import { run } from './run';
import {
  Identify,
  IdentifyValues,
  SelectAuthenticator,
  SelectAuthenticatorValues,
  EnrollOrChallengeAuthenticator,
  EnrollOrChallengeAuthenticatorValues,
  AuthenticatorVerificationData,
  AuthenticatorVerificationDataValues,
} from './remediators';

const flow: RemediationFlow = {
  'identify-recovery': Identify,
  'select-authenticator-authenticate': SelectAuthenticator,
  'challenge-authenticator': EnrollOrChallengeAuthenticator,
  'authenticator-verification-data': AuthenticatorVerificationData,
  'reset-authenticator': EnrollOrChallengeAuthenticator,
};

export interface PasswordRecoveryOptions extends 
  IdxOptions, 
  IdentifyValues,
  SelectAuthenticatorValues,
  EnrollOrChallengeAuthenticatorValues,
  AuthenticatorVerificationDataValues {
}

export async function recoverPassword(
  authClient: OktaAuth, options: PasswordRecoveryOptions
): Promise<AuthTransaction> {
  return run(authClient, { 
    ...options, 
    flow,
    needInteraction: true,
    action: 'currentAuthenticator-recover',
  });
}
