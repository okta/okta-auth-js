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
  EnrollOrChallengeAuthenticator,
  EnrollOrChallengeAuthenticatorValues,
} from './remediators';

const flow: RemediationFlow = {
  'identify': Identify,
  'challenge-authenticator': EnrollOrChallengeAuthenticator,
};

export interface AuthenticationOptions extends 
  IdxOptions,
  IdentifyValues,
  EnrollOrChallengeAuthenticatorValues {
}

export async function authenticate(
  authClient: OktaAuth, options: AuthenticationOptions
): Promise<AuthTransaction> {
  return run(authClient, { 
    ...options, 
    flow,
    needInteraction: false 
  });
}
