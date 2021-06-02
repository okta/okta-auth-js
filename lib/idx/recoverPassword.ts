import { run, RemediationFlow } from './run';
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
import { PasswordRecoveryFlowMonitor } from './flowMonitors';
import { 
  OktaAuth, 
  IdxOptions, 
  IdxTransaction,
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
  const flowMonitor = new PasswordRecoveryFlowMonitor();
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
