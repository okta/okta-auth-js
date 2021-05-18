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
  AuthenticatorVerificationData,
  AuthenticatorVerificationDataValues,
  ResetAuthenticator,
  ResetAuthenticatorValues,
} from './remediators';
import { FlowMonitor } from './flowMonitors';

const flow: RemediationFlow = {
  'identify': Identify,
  'identify-recovery': Identify,
  'select-authenticator-authenticate': SelectAuthenticatorAuthenticate,
  'challenge-authenticator': ChallengeAuthenticator,
  'authenticator-verification-data': AuthenticatorVerificationData,
  'reset-authenticator': ResetAuthenticator,
};

export type PasswordRecoveryOptions = IdxOptions 
  & IdentifyValues 
  & SelectAuthenticatorAuthenticateValues 
  & ChallengeAuthenticatorValues 
  & ResetAuthenticatorValues
  & AuthenticatorVerificationDataValues;

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
