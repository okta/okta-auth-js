import { Base as Remediator } from '../remediators';

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

  isRemediatorCandidate(remediator: Remediator): boolean {
    const remediatorName = remediator.getName();
    if (remediatorName === 'skip') {
      return false;
    }
    return true;
  }
}
