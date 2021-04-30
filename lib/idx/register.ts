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
  AuthenticatorEnrollmentData,
  AuthenticatorEnrollmentDataValues,
  Skip,
  SkipValues,
} from './remediators';

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
): Promise<AuthTransaction> {
  return run(authClient, { 
    ...options, 
    flow,
    allowedNextSteps: [
      'enroll-profile',
      'authenticator-enrollment-data',
      'select-authenticator-enroll',
      'enroll-authenticator'
    ]
  });
}
