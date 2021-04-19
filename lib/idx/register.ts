import { AuthTransaction } from '../tx';
import { 
  OktaAuth,
  RegistrationOptions,
  RemediationFlow,
} from '../types';
import { run } from './run';
import { 
  SelectEnrollProfile,
  EnrollProfile,
  SelectAuthenticator,
  EnrollOrChallengeAuthenticator,
} from './remediators';

const flow: RemediationFlow = {
  'select-enroll-profile': SelectEnrollProfile,
  'enroll-profile': EnrollProfile,
  'select-authenticator-enroll': SelectAuthenticator,
  'enroll-authenticator': EnrollOrChallengeAuthenticator,
};

export async function register(
  authClient: OktaAuth, options: RegistrationOptions
): Promise<AuthTransaction> {
  return run(authClient, { 
    ...options, 
    flow,
    needInteraction: true 
  });
}
