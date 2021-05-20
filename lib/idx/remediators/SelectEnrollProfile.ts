import { Remediator, RemediationValues } from './Base/Remediator';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SelectEnrollProfileValues extends RemediationValues {}

export class SelectEnrollProfile extends Remediator {
  static remediationName = 'select-enroll-profile';

  values: SelectEnrollProfileValues;

  canRemediate() {
    return true;
  }
}
