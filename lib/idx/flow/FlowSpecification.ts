import { OktaAuthIdxInterface, FlowIdentifier } from '../types';
import { AuthenticationFlow } from './AuthenticationFlow';
import { PasswordRecoveryFlow } from './PasswordRecoveryFlow';
import { RegistrationFlow } from './RegistrationFlow';
import { AccountUnlockFlow } from './AccountUnlockFlow';
import { RemediationFlow } from './RemediationFlow';

export interface FlowSpecification {
  flow: FlowIdentifier;
  remediators: RemediationFlow;
  actions?: string[];
  withCredentials?: boolean;
}

// eslint-disable-next-line complexity
export function getFlowSpecification(
  oktaAuth: OktaAuthIdxInterface,
  flow: FlowIdentifier = 'default',
  useGenericRemediation = false
): FlowSpecification {
  let remediators, actions, withCredentials = true;
  switch (flow) {
    case 'register':
    case 'signup':
    case 'enrollProfile':
      remediators = RegistrationFlow;
      if (useGenericRemediation) {
        actions = [
          'select-enroll-profile'
        ];
      }
      withCredentials = false;
      break;
    case 'recoverPassword':
    case 'resetPassword':
      remediators = PasswordRecoveryFlow;
      actions = [
        'currentAuthenticator-recover', 
        'currentAuthenticatorEnrollment-recover'
      ];
      withCredentials = false;
      break;
    case 'unlockAccount':
      remediators = AccountUnlockFlow;
      withCredentials = false;
      actions = [
        'unlock-account'
      ];
      break;
    case 'authenticate':
    case 'login':
    case 'signin':
      remediators = AuthenticationFlow;
      break;
    default:
      // default case has no flow monitor
      remediators = AuthenticationFlow;
      break;
  }
  return { flow, remediators, actions, withCredentials };
}
