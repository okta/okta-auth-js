import { OktaAuthIdxInterface, FlowIdentifier, FlowSpecification } from '../types';
import { AuthenticationFlow } from './AuthenticationFlow';
import { PasswordRecoveryFlow } from './PasswordRecoveryFlow';
import { RegistrationFlow } from './RegistrationFlow';
import { AccountUnlockFlow } from './AccountUnlockFlow';

// eslint-disable-next-line complexity
export function getFlowSpecification(
  oktaAuth: OktaAuthIdxInterface,
  flow: FlowIdentifier = 'default'
): FlowSpecification {
  let remediators, actions, withCredentials = true;
  switch (flow) {
    case 'register':
    case 'signup':
    case 'enrollProfile':
      remediators = RegistrationFlow;
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
