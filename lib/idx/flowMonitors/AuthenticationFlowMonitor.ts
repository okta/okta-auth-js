import { Remediator } from '../remediators';
import { FlowMonitor } from './FlowMonitor';
import { IdxRemediation } from '../types/idx-js';

export class AuthenticationFlowMonitor extends FlowMonitor {
  isRemediatorCandidate(remediator: Remediator, remediations?: IdxRemediation[]) {
    const prevRemediatorName = this.previousRemediator?.getName();
    const remediatorName = remediator.getName();
    
    if (remediatorName === 'select-authenticator-authenticate' 
      && ['select-authenticator-authenticate'].includes(prevRemediatorName)) {
      return false;
    }

    if (remediatorName === 'select-authenticator-authenticate' 
      && remediations.some(({ name }) => name === 'challenge-authenticator')) {
      return false;
    }

    return super.isRemediatorCandidate(remediator);
  }
}
