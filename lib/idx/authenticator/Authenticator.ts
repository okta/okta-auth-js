import { RemediationValues } from '../remediators';
import { IdxAuthenticator, IdxRemediationValue } from '../types/idx-js';


export interface Credentials {
  [key: string]: string;
}

export abstract class Authenticator {
  meta: IdxAuthenticator;

  constructor(authenticator: IdxAuthenticator) {
    this.meta = authenticator;
  }

  abstract canVerify(values: RemediationValues): boolean;

  abstract mapCredentials(values: RemediationValues): Credentials;

  abstract getInputs(idxRemediationValue: IdxRemediationValue): any; // TODO: add type
}
