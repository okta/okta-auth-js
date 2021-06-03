import { FlowMonitor } from './FlowMonitor';

export class PasswordRecoveryFlowMonitor extends FlowMonitor {
  isRemediatorCandidate(remediator, remediations?, values?) {
    const prevRemediatorName = this.previousRemediator?.getName();
    const remediatorName = remediator.getName();
    
    if (remediatorName === 'select-authenticator-authenticate' 
      && [
        'select-authenticator-authenticate',
        'reenroll-authenticator'
      ].includes(prevRemediatorName)) {
      return false;
    }

    if (remediatorName === 'select-authenticator-authenticate' 
      && remediations.some(({ name }) => name === 'challenge-authenticator')) {
      return false;
    }

    return super.isRemediatorCandidate(remediator, remediations, values);
  }
}
