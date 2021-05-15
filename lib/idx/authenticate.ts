import { 
  OktaAuth,
  IdxOptions,
  IdxTransaction,
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
  RedirectIdp,
  AuthenticatorEnrollmentData,
  AuthenticatorEnrollmentDataValues
} from './remediators';
import { FlowMonitor } from './flowMonitors';

const flow: RemediationFlow = {
  'identify': Identify,
  'select-authenticator-authenticate': SelectAuthenticator,
  'authenticator-enrollment-data': AuthenticatorEnrollmentData,
  'challenge-authenticator': EnrollOrChallengeAuthenticator,
  'enroll-authenticator': EnrollOrChallengeAuthenticator,
  'reenroll-authenticator': ReEnrollAuthenticator,
  'redirect-idp': RedirectIdp
};

export interface AuthenticationOptions extends 
  IdxOptions,
  IdentifyValues,
  SelectAuthenticatorValues,
  EnrollOrChallengeAuthenticatorValues,
  ReEnrollAuthenticatorValues,
  AuthenticatorEnrollmentDataValues {
}

export async function authenticate(
  authClient: OktaAuth, options: AuthenticationOptions
): Promise<IdxTransaction> {
  options = options || {};

  // Select password authenticator if password is provided
  const { password, authenticators = [] } = options;
  if (password && !authenticators.includes('password')) {
    options = {
      ...options,
      authenticators: ['password', ...authenticators]
    };
  }

  const flowMonitor = new FlowMonitor();

  return run(authClient, { 
    ...options, 
    flow,
    flowMonitor,
  });
}
