import { AuthTransaction } from '../tx';
import { 
  OktaAuth, 
  PasswordRecoveryOptions,
  RemediationFlow,
} from '../types';
import { run } from './run';
import {
  Identify,
  SelectAuthenticator,
  EnrollOrChallengeAuthenticator,
  AuthenticatorVerificationData,
} from './remediators';

const flow: RemediationFlow = {
  'identify-recovery': Identify,
  'select-authenticator-authenticate': SelectAuthenticator,
  'challenge-authenticator': EnrollOrChallengeAuthenticator,
  'authenticator-verification-data': AuthenticatorVerificationData,
  'reset-authenticator': EnrollOrChallengeAuthenticator,
};

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
