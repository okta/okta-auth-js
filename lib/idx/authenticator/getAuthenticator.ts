import { Authenticator } from './Authenticator';
import { GeneralAuthenticator } from './GeneralAuthenticator';
import { OktaPassword } from './OktaPassword';
import { SecurityQuestion } from './SecurityQuestion';
import { IdxRemediation } from '../types/idx-js';
import { AuthenticatorKey } from '../types';

export function getAuthenticator(remediation: IdxRemediation): Authenticator {
  const { relatesTo: { value } = {} } = remediation;
  switch (value.key) {
    case AuthenticatorKey.OKTA_PASSWORD:
      return new OktaPassword(value);
    case AuthenticatorKey.SECURITY_QUESTION:
      return new SecurityQuestion(value);
    default:
      return new GeneralAuthenticator(value);
  }
}
