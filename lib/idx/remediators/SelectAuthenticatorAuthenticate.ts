import { SelectAuthenticator, SelectAuthenticatorValues } from './/Base/SelectAuthenticator';

export type SelectAuthenticatorAuthenticateValues = SelectAuthenticatorValues;

export class SelectAuthenticatorAuthenticate extends SelectAuthenticator {
  static remediationName = 'select-authenticator-authenticate';
  values: SelectAuthenticatorAuthenticateValues;
}
