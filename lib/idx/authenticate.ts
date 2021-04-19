import { AuthTransaction } from '../tx';
import { 
  OktaAuth, 
  AuthenticationOptions,
  RemediationFlow
} from '../types';
import { run } from './run';
import { Identify, EnrollOrChallengeAuthenticator } from './remediators';

const flow: RemediationFlow = {
  'identify': Identify,
  'challenge-authenticator': EnrollOrChallengeAuthenticator,
};

export async function authenticate(
  authClient: OktaAuth, options: AuthenticationOptions
): Promise<AuthTransaction> {
  return run(authClient, { 
    ...options, 
    flow,
    needInteraction: false 
  });
}
