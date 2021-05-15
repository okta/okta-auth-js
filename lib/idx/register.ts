import { 
  IdxOptions, 
  IdxTransaction, 
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
  AuthenticatorEnrollmentData,
  AuthenticatorEnrollmentDataValues,
  Skip,
  SkipValues,
} from './remediators';
import { RegistrationFlowMonitor } from './flowMonitors';

const flow: RemediationFlow = {
  'select-enroll-profile': SelectEnrollProfile,
  'enroll-profile': EnrollProfile,
  'authenticator-enrollment-data': AuthenticatorEnrollmentData,
  'select-authenticator-enroll': SelectAuthenticator,
  'enroll-authenticator': EnrollOrChallengeAuthenticator,
  'skip': Skip,
};

export interface RegistrationOptions extends 
  IdxOptions,
  SelectEnrollProfileValues,
  EnrollProfileValues,
  SelectAuthenticatorValues,
  EnrollOrChallengeAuthenticatorValues,
  AuthenticatorEnrollmentDataValues,
  SkipValues {
}

export async function register(
  authClient: OktaAuth, options: RegistrationOptions
): Promise<IdxTransaction> {
  const flowMonitor = new RegistrationFlowMonitor();
  return run(authClient, { 
    ...options, 
    flow,
    flowMonitor,
  });
}
