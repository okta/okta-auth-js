export * from './getAuthenticator';
export * from './Authenticator';
export * from './VerificationCodeAuthenticator';
export * from './OktaPassword';
export * from './SecurityQuestionEnrollment';
export * from './SecurityQuestionVerification';
export * from './WebauthnEnrollment';
export * from './WebauthnVerification';

import { OktaPasswordInputValues } from './OktaPassword';
import { SecurityQuestionEnrollValues } from './SecurityQuestionEnrollment';
import { SecurityQuestionVerificationValues } from './SecurityQuestionVerification';
import { VerificationCodeValues } from './VerificationCodeAuthenticator';
import { WebauthnEnrollValues } from './WebauthnEnrollment';
import { WebauthnVerificationValues } from './WebauthnVerification';

export type AuthenticatorValues = OktaPasswordInputValues
  & SecurityQuestionEnrollValues
  & SecurityQuestionVerificationValues
  & VerificationCodeValues
  & WebauthnEnrollValues
  & WebauthnVerificationValues;
