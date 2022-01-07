import { OktaAuth, FlowIdentifier } from '../../types';
import { AuthenticationFlow } from './AuthenticationFlow';
import { PasswordRecoveryFlow } from './PasswordRecoveryFlow';
import { RegistrationFlow } from './RegistrationFlow';
import { RemediationFlow } from './RemediationFlow';

export interface FlowSpecification {
  flow: FlowIdentifier;
  remediators: RemediationFlow;
  actions?: string[];
  withCredentials?: boolean;
}

// eslint-disable-next-line complexity
export function getFlowSpecification(oktaAuth: OktaAuth, flow: FlowIdentifier = 'default'): FlowSpecification {
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
