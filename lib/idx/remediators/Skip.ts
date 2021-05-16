import { Remediator, RemediationValues } from './Remediator';

export interface SkipValues extends RemediationValues {
  skip?: boolean;
}

export class Skip extends Remediator {
  values: SkipValues;

  canRemediate() {
    return !!this.values.skip;
  }

}
