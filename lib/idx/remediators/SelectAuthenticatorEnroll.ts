import { SelectAuthenticator, SelectAuthenticatorValues } from './Base/SelectAuthenticator';

export type SelectAuthenticatorEnrollValues = SelectAuthenticatorValues;

export class SelectAuthenticatorEnroll extends SelectAuthenticator {
  static remediationName = 'select-authenticator-enroll';
  values: SelectAuthenticatorEnrollValues;
}
