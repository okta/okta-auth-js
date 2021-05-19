import { Remediator } from '../remediators';
import { FlowMonitor } from './FlowMonitor';

export class RegistrationFlowMonitor extends FlowMonitor {
  isRemediatorCandidate(remediator: Remediator) {
    const prevRemediatorName = this.previousRemediator?.getName();
    const remediatorName = remediator.getName();
    if (remediatorName === 'select-authenticator-enroll' 
      && [
          'select-authenticator-enroll', 
          'authenticator-enrollment-data'
        ].includes(prevRemediatorName)) {
      return false;
    }

    return super.isRemediatorCandidate(remediator);
  }
}
