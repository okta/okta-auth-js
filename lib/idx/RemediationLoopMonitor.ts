import { Base as Remediator } from './remediators';

export default class RemediationLoopMonitor {
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
}
