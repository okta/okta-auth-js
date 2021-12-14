import { RemediationValues } from '../remediators';
import { IdxAuthenticator, IdxRemediationValue } from '../types/idx-js';

export abstract class Authenticator {
  meta: IdxAuthenticator;

  constructor(authenticator: IdxAuthenticator) {
    this.meta = authenticator;
  }

  abstract canVerify(values: RemediationValues): boolean;

  abstract mapCredentials(values: RemediationValues): any; // TODO: add type

  abstract getInputs(idxRemediationValue: IdxRemediationValue): any; // TODO: add type
}
