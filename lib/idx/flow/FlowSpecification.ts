import { OktaAuth, FlowIdentifier } from '../../types';
import { AuthenticationFlow } from './AuthenticationFlow';
import { AuthenticationFlowMonitor } from './AuthenticationFlowMonitor';
import { FlowMonitor } from './FlowMonitor';
import { PasswordRecoveryFlow } from './PasswordRecoveryFlow';
import { PasswordRecoveryFlowMonitor } from './PasswordRecoveryFlowMonitor';
import { RegistrationFlow } from './RegistrationFlow';
import { RegistrationFlowMonitor } from './RegistrationFlowMonitor';
import { RemediationFlow } from './RemediationFlow';

export interface FlowSpecification {
  flow: FlowIdentifier;
  remediators: RemediationFlow;
  flowMonitor: FlowMonitor;
  actions?: string[];
}

export function getFlowSpecification(oktaAuth: OktaAuth, flow: FlowIdentifier = 'proceed'): FlowSpecification {
  let remediators, flowMonitor, actions;
  switch (flow) {
    case 'register':
    case 'signup':
    case 'enrollProfile':
      remediators = RegistrationFlow;
      flowMonitor = new RegistrationFlowMonitor(oktaAuth);
      break;
    case 'recoverPassword':
    case 'resetPassword':
      remediators = PasswordRecoveryFlow;
      flowMonitor = new PasswordRecoveryFlowMonitor(oktaAuth);
      actions = [
        'currentAuthenticator-recover', 
        'currentAuthenticatorEnrollment-recover'
      ];
      break;
    default:
      // authenticate
      remediators = AuthenticationFlow;
      flowMonitor = new AuthenticationFlowMonitor(oktaAuth);
      break;
  }
  return { flow, remediators, flowMonitor, actions };
}
