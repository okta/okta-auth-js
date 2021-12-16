import { Authenticator } from './Authenticator';
import { VerificationCodeAuthenticator } from './VerificationCodeAuthenticator';
import { OktaPassword } from './OktaPassword';
import { SecurityQuestionEnrollment } from './SecurityQuestionEnrollment';
import { SecurityQuestionVerification } from './SecurityQuestionVerification';
import { IdxRemediation } from '../types/idx-js';
import { AuthenticatorKey } from '../types';

export function getAuthenticator(remediation: IdxRemediation): Authenticator {
  const { relatesTo: { value } = {} } = remediation;
  switch (value.key) {
    case AuthenticatorKey.OKTA_PASSWORD:
      return new OktaPassword(value);
    case AuthenticatorKey.SECURITY_QUESTION:
      if (value.contextualData.enrolledQuestion) {
        return new SecurityQuestionVerification(value);
      } else {
        return new SecurityQuestionEnrollment(value);
      }
    default:
      return new VerificationCodeAuthenticator(value);
  }
}
