import { Base, RemediationValues } from './Base';

export interface SkipValues extends RemediationValues {
  skip?: boolean;
}

export class Skip extends Base {
  values: SkipValues;

  canRemediate() {
    return !!this.values.skip;
  }

}
