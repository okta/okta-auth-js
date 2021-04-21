import { AuthTransaction } from '../tx';
import { 
  IdxOptions, 
  OktaAuth, 
  RemediationFlow, 
} from '../types';
import { run } from './run';
import { 
  SelectEnrollProfile,
  SelectEnrollProfileValues,
  EnrollProfile,
  EnrollProfileValues,
  SelectAuthenticator,
  SelectAuthenticatorValues,
  EnrollOrChallengeAuthenticator,
  EnrollOrChallengeAuthenticatorValues,
} from './remediators';

const flow: RemediationFlow = {
  'select-enroll-profile': SelectEnrollProfile,
  'enroll-profile': EnrollProfile,
  'select-authenticator-enroll': SelectAuthenticator,
  'enroll-authenticator': EnrollOrChallengeAuthenticator,
};

export interface RegistrationOptions extends 
  IdxOptions,
  SelectEnrollProfileValues,
  EnrollProfileValues,
  SelectAuthenticatorValues,
  EnrollOrChallengeAuthenticatorValues {
}

export async function register(
  authClient: OktaAuth, options: RegistrationOptions
): Promise<AuthTransaction> {
  return run(authClient, { 
    ...options, 
    flow,
    needInteraction: true 
  });
}
