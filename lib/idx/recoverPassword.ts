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
  AuthenticatorVerificationData,
  AuthenticatorVerificationDataValues,
} from './remediators';
import { FlowMonitor } from './flowMonitors';

const flow: RemediationFlow = {
  'identify': Identify,
  'identify-recovery': Identify,
  'select-authenticator-authenticate': SelectAuthenticator,
  'challenge-authenticator': EnrollOrChallengeAuthenticator,
  'authenticator-verification-data': AuthenticatorVerificationData,
  'reset-authenticator': EnrollOrChallengeAuthenticator,
};

export interface PasswordRecoveryOptions extends 
  IdxOptions, 
  IdentifyValues,
  SelectAuthenticatorValues,
  EnrollOrChallengeAuthenticatorValues,
  AuthenticatorVerificationDataValues {
}

export async function recoverPassword(
  authClient: OktaAuth, options: PasswordRecoveryOptions
): Promise<IdxTransaction> {
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
