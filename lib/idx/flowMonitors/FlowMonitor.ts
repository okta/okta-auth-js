import { Remediator, RemediationValues, SkipValues } from '../remediators';
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

  isRemediatorCandidate(
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    remediator: Remediator, remediations?: IdxRemediation[], values?: RemediationValues & SkipValues
  ): boolean {
    const remediatorName = remediator.getName();
    if (!values.skip && remediatorName === 'skip') {
      return false;
    }
    if (values.skip && remediatorName !== 'skip') {
      return false;
    }
    return true;
  }
}
