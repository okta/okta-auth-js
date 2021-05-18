import { Remediator } from './Base/Remediator';

export class RedirectIdp extends Remediator {
  static remediationName = 'redirect-idp';

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
