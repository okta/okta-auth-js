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
  ReEnrollAuthenticator,
  ReEnrollAuthenticatorValues,
  RedirectIdp
} from './remediators';

const flow: RemediationFlow = {
  'identify': Identify,
  'select-authenticator-authenticate': SelectAuthenticator,
  'challenge-authenticator': EnrollOrChallengeAuthenticator,
  'reenroll-authenticator': ReEnrollAuthenticator,
  'redirect-idp': RedirectIdp
};

export interface AuthenticationOptions extends 
  IdxOptions,
  IdentifyValues,
  SelectAuthenticatorValues,
  EnrollOrChallengeAuthenticatorValues,
  ReEnrollAuthenticatorValues {
}

export async function authenticate(
  authClient: OktaAuth, options: AuthenticationOptions
): Promise<AuthTransaction> {
  return run(authClient, { 
    ...options, 
    flow,
    allowedNextSteps: [
      'select-authenticator-authenticate',
      'challenge-authenticator',
      'reenroll-authenticator',
      'redirect-idp',
    ]
  });
}
