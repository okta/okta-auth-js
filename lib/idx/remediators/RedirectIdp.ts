import { Base } from './Base';

export class RedirectIdp extends Base {

  canRemediate() {
    return false;
  }

  getNextStep() {
    const { name, type, idp, href } = this.remediation;
    return {
      name,
      type,
      idp,
      href
    };
  }

}
