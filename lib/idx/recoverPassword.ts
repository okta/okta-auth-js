import { AuthTransaction } from '../tx';
import { 
  OktaAuth, 
  IdxOptions, 
  RemediationFlow,
  IdxStatus,
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
import { interact } from './interact';

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
): Promise<AuthTransaction> {
  let error;
  let status;

  try {
    const interactResponse = await interact(authClient, options);
    const idxResponse = interactResponse.idxResponse;
    const shouldIdentify = idxResponse.neededToProceed.some(({ name }) => name === 'identify') 
      && !Object.keys(idxResponse.actions).includes('currentAuthenticator-recover');
    if (shouldIdentify) {
      options = { 
        ...options, 
        // When set any factor as primary factor in policy
        // Select password authenticator first to start the recovery password flow
        authenticators: ['password', ...(options.authenticators || [])]
      };
    }

    return run(
      authClient, 
      { 
        ...options,
        flow,
        actions: [
          'currentAuthenticator-recover', 
          'currentAuthenticatorEnrollment-recover'
        ],
      },
      interactResponse,
    );

  } catch (err) {
    error = err;
    status = IdxStatus.FAILED;
    // Clear transaction meta when error is not handlable
    authClient.transactionManager.clear();
  }

  const authTransaction = new AuthTransaction(authClient, {
    status,
    error,
  });
  return authTransaction;
}
