import { Remediator, RemediationValues } from './Remediator';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SelectEnrollProfileValues extends RemediationValues {}

export class SelectEnrollProfile extends Remediator {
  values: SelectEnrollProfileValues;

  canRemediate() {
    return true;
  }
}
