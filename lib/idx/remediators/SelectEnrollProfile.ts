import { Base, RemediationValues } from './Base';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SelectEnrollProfileValues extends RemediationValues {}

export class SelectEnrollProfile extends Base {
  values: SelectEnrollProfileValues;

  canRemediate() {
    return true;
  }
}
