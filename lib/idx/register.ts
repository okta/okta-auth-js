import { run, RemediationFlow } from './run';
import { transactionMetaExist } from './transactionMeta';
import { startTransaction } from './startTransaction';
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
import { AuthSdkError } from '../errors';
import { 
  IdxOptions, 
  IdxTransaction, 
  OktaAuth, 
  IdxFeature,
  IdxStatus,
} from '../types';

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
  // Only check at the beginning of the transaction
  if (!transactionMetaExist(authClient)) {
    const { enabledFeatures } = await startTransaction(authClient, options);
    if (enabledFeatures && !enabledFeatures.includes(IdxFeature.REGISTRATION)) {
      const error = new AuthSdkError('Registration is not supported based on your current org configuration.');
      return { status: IdxStatus.FAILURE, error };
    }
  }
  
  const flowMonitor = new RegistrationFlowMonitor();
  return run(authClient, { 
    ...options, 
    flow,
    flowMonitor,
  });
}
