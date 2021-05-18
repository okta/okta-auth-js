import { Remediator } from '../remediators';
import { IdxRemediation } from '../types/idx-js';

export class FlowMonitor {
  previousRemediator: Remediator;

  shouldBreak(remediator: Remediator): boolean {
    if (!this.previousRemediator) {
      this.previousRemediator = remediator;
      return false;
    }

    if (this.previousRemediator.getName() === remediator.getName()) {
      return true;
    }

    this.previousRemediator = remediator;
    return false;
  }

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  isRemediatorCandidate(remediator: Remediator, remediations?: IdxRemediation[]): boolean {
    const remediatorName = remediator.getName();
    if (remediatorName === 'skip') {
      return false;
    }
    return true;
  }
}
