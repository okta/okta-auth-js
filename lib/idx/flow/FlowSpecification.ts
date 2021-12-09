import { OktaAuth, FlowIdentifier } from '../../types';
import { AuthenticationFlow } from './AuthenticationFlow';
import { PasswordRecoveryFlow } from './PasswordRecoveryFlow';
import { RegistrationFlow } from './RegistrationFlow';
import { RemediationFlow } from './RemediationFlow';

export interface FlowSpecification {
  flow: FlowIdentifier;
  remediators: RemediationFlow;
  actions?: string[];
}

export function getFlowSpecification(oktaAuth: OktaAuth, flow: FlowIdentifier = 'proceed'): FlowSpecification {
  let remediators, actions;
  switch (flow) {
    case 'register':
    case 'signup':
    case 'enrollProfile':
      remediators = RegistrationFlow;
      break;
    case 'recoverPassword':
    case 'resetPassword':
      remediators = PasswordRecoveryFlow;
      actions = [
        'currentAuthenticator-recover', 
        'currentAuthenticatorEnrollment-recover'
      ];
      break;
    default:
      // authenticate
      remediators = AuthenticationFlow;
      break;
  }
  return { flow, remediators, actions };
}
