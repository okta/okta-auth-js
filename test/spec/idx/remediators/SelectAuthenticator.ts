import { SelectAuthenticatorAuthenticate, SelectAuthenticatorEnroll } from '../../../../lib/idx/remediators';
import {
  SelectAuthenticatorEnrollRemediationFactory,
  SelectAuthenticatorAuthenticateRemediationFactory,
  AuthenticatorValueFactory,
  PhoneAuthenticatorOptionFactory,
  EmailAuthenticatorOptionFactory,
  IdxContextFactory,
  PhoneAuthenticatorFactory,
  EmailAuthenticatorFactory,
} from '@okta/test.support/idx';

describe('remediators/SelectAuthenticatorEnroll', () => {
  describe('canRemediate', () => {
    it('retuns false if matched authenticator is already the current one', () => {
      const currentAuthenticator = EmailAuthenticatorFactory.build();
      const remediation = SelectAuthenticatorEnrollRemediationFactory.build({
        value: [
          AuthenticatorValueFactory.build({
            options: [
              EmailAuthenticatorOptionFactory.params({
                _authenticator: currentAuthenticator,
              }).build(),
            ]
          }),
        ]
      });
      const context = IdxContextFactory.build({
        currentAuthenticator: {
          value: currentAuthenticator
        }
      });
      const authenticators = [
        currentAuthenticator,
      ];
      const r = new SelectAuthenticatorEnroll(remediation, { authenticators });
      expect(r.canRemediate(context)).toBe(false);
      expect(r.canRemediate()).toBe(true);
    });
  });
});

describe('remediators/SelectAuthenticatorAuthenticate', () => {
  describe('canRemediate', () => {
    it('retuns false if matched authenticator is already the current one', () => {
      const currentAuthenticatorEnrollment = PhoneAuthenticatorFactory.build();
      const remediation = SelectAuthenticatorAuthenticateRemediationFactory.build({
        value: [
          AuthenticatorValueFactory.build({
            options: [
              PhoneAuthenticatorOptionFactory.params({
                _authenticator: currentAuthenticatorEnrollment,
              }).build(),
            ]
          }),
        ]
      });
      const context = IdxContextFactory.build({
        currentAuthenticatorEnrollment: {
          value: currentAuthenticatorEnrollment
        }
      });
      const authenticators = [
        currentAuthenticatorEnrollment,
      ];
      const r = new SelectAuthenticatorAuthenticate(remediation, { authenticators });
      expect(r.canRemediate(context)).toBe(false);
      expect(r.canRemediate()).toBe(true);
    });
  });
});
