import { Remediator } from './Remediator';

export class RedirectIdp extends Remediator {

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
