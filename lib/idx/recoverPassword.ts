import { run, RemediationFlow } from './run';
import { transactionMetaExist } from './transactionMeta';
import {
  Identify,
  IdentifyValues,
  SelectAuthenticatorAuthenticate,
  SelectAuthenticatorAuthenticateValues,
  ChallengeAuthenticator,
  ChallengeAuthenticatorValues,
  AuthenticatorVerificationData,
  AuthenticatorVerificationDataValues,
  ResetAuthenticator,
  ResetAuthenticatorValues,
  ReEnrollAuthenticator,
  ReEnrollAuthenticatorValues,
} from './remediators';
import { FlowMonitor } from './flowMonitors';
import { startTransaction } from './startTransaction';
import { AuthSdkError } from '../errors';
import { 
  OktaAuth, 
  IdxOptions, 
  IdxTransaction,
  IdxFeature,
  IdxStatus,
} from '../types';

const flow: RemediationFlow = {
  'identify': Identify,
  'identify-recovery': Identify,
  'select-authenticator-authenticate': SelectAuthenticatorAuthenticate,
  'challenge-authenticator': ChallengeAuthenticator,
  'authenticator-verification-data': AuthenticatorVerificationData,
  'reset-authenticator': ResetAuthenticator,
  'reenroll-authenticator': ReEnrollAuthenticator,
};

export type PasswordRecoveryOptions = IdxOptions 
  & IdentifyValues 
  & SelectAuthenticatorAuthenticateValues 
  & ChallengeAuthenticatorValues 
  & ResetAuthenticatorValues
  & AuthenticatorVerificationDataValues
  & ReEnrollAuthenticatorValues;

export async function recoverPassword(
  authClient: OktaAuth, options: PasswordRecoveryOptions
): Promise<IdxTransaction> {
  // Only check at the beginning of the transaction
  if (!transactionMetaExist(authClient)) {
    const { enabledFeatures } = await startTransaction(authClient, options);
    if (enabledFeatures && !enabledFeatures.includes(IdxFeature.PASSWORD_RECOVERY)) {
      const error = new AuthSdkError('Password recovery is not supported based on your current org configuration.');
      return { status: IdxStatus.FAILURE, error };
    }
  }

  const flowMonitor = new FlowMonitor();
  return run(
    authClient, 
    { 
      ...options,
      flow,
      flowMonitor,
      actions: [
        'currentAuthenticator-recover', 
        'currentAuthenticatorEnrollment-recover'
      ],
    }
  );
}
