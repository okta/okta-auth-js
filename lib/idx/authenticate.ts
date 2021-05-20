import { 
  OktaAuth,
  IdxOptions,
  IdxTransaction,
} from '../types';
import { run, RemediationFlow } from './run';
import { 
  Identify,
  IdentifyValues,
  SelectAuthenticatorAuthenticate,
  SelectAuthenticatorAuthenticateValues,
  ChallengeAuthenticator,
  ChallengeAuthenticatorValues,
  ReEnrollAuthenticator,
  ReEnrollAuthenticatorValues,
  RedirectIdp,
  AuthenticatorEnrollmentData,
  AuthenticatorEnrollmentDataValues,
  SelectAuthenticatorEnroll,
  SelectAuthenticatorEnrollValues,
  EnrollAuthenticator,
  EnrollAuthenticatorValues,
} from './remediators';
import { AuthenticationFlowMonitor } from './flowMonitors';

const flow: RemediationFlow = {
  'identify': Identify,
  'select-authenticator-authenticate': SelectAuthenticatorAuthenticate,
  'select-authenticator-enroll': SelectAuthenticatorEnroll,
  'authenticator-enrollment-data': AuthenticatorEnrollmentData,
  'enroll-authenticator': EnrollAuthenticator,
  'challenge-authenticator': ChallengeAuthenticator,
  'reenroll-authenticator': ReEnrollAuthenticator,
  'redirect-idp': RedirectIdp
};

export type AuthenticationOptions = IdxOptions 
  & IdentifyValues 
  & SelectAuthenticatorAuthenticateValues 
  & SelectAuthenticatorEnrollValues
  & ChallengeAuthenticatorValues 
  & ReEnrollAuthenticatorValues
  & AuthenticatorEnrollmentDataValues
  & EnrollAuthenticatorValues;

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

  const flowMonitor = new AuthenticationFlowMonitor();
  return run(authClient, { 
    ...options, 
    flow,
    flowMonitor,
  });
}
