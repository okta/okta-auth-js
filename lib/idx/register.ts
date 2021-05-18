import { 
  IdxOptions, 
  IdxTransaction, 
  OktaAuth, 
} from '../types';
import { run, RemediationFlow } from './run';
import { 
  SelectEnrollProfile,
  EnrollProfile,
  EnrollProfileValues,
  SelectAuthenticatorEnroll,
  SelectAuthenticatorEnrollValues,
  EnrollAuthenticator,
  EnrollAuthenticatorValues,
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
  'select-authenticator-enroll': SelectAuthenticatorEnroll,
  'enroll-authenticator': EnrollAuthenticator,
  'skip': Skip,
};

export type RegistrationOptions = IdxOptions 
  & EnrollProfileValues 
  & SelectAuthenticatorEnrollValues 
  & EnrollAuthenticatorValues 
  & AuthenticatorEnrollmentDataValues 
  & SkipValues;

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
