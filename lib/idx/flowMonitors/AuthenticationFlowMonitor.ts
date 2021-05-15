import { Base as Remediator } from '../remediators';
import { FlowMonitor } from './FlowMonitor';

export class AuthenticationFlowMonitor extends FlowMonitor {
  isRemediatorCandidate(remediator: Remediator) {
    const prevRemediatorName = this.previousRemediator?.getName();
    const remediatorName = remediator.getName();
    if (remediatorName === 'select-authenticator-authenticate' 
      && ['select-authenticator-authenticate'].includes(prevRemediatorName)) {
      return false;
    }

    return super.isRemediatorCandidate(remediator);
  }
}
