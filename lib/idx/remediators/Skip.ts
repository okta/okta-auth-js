import { Remediator, RemediationValues } from './Base/Remediator';

export interface SkipValues extends RemediationValues {
  skip?: boolean;
}

export class Skip extends Remediator {
  static remediationName = 'skip';

  values: SkipValues;

  canRemediate() {
    return !!this.values.skip;
  }

}
