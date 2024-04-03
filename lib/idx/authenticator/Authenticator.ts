import { IdxAuthenticator, IdxRemediationValue } from '../types/idx-js';


export interface Credentials {
  // except strings there can be additional options like revokeSessions
  [key: string]: string | boolean | number | undefined;
}

export abstract class Authenticator<Values> {
  meta: IdxAuthenticator;

  constructor(authenticator: IdxAuthenticator) {
    this.meta = authenticator;
  }

  abstract canVerify(values: Values): boolean;

  abstract mapCredentials(values: Values): Credentials | undefined;

  abstract getInputs(idxRemediationValue: IdxRemediationValue): any; // TODO: add type
}
