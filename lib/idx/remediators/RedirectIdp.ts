import { Base } from './Base';

export class RedirectIdp extends Base {

  canRemediate() {
    return true;
  }
}
