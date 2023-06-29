import { SelectAuthenticatorAuthenticate } from '../../../../lib/idx/remediators';
import {
  SelectAuthenticatorEnrollRemediationFactory,
  AuthenticatorValueFactory,
  PhoneAuthenticatorOptionFactory,
  IdxContextFactory,
  PhoneAuthenticatorFactory,
} from '@okta/test.support/idx';

describe('remediators/Base/SelectAuthenticator', () => {
  describe('canRemediate', () => {
    it('retuns false if matched authenticator is already the current one', () => {
      const currentAuthenticator = PhoneAuthenticatorFactory.build();
      const remediation = SelectAuthenticatorEnrollRemediationFactory.build({
        value: [
          AuthenticatorValueFactory.build({
            options: [
              PhoneAuthenticatorOptionFactory.params({
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
      const r = new SelectAuthenticatorAuthenticate(remediation, { authenticators });
      expect(r.canRemediate(context)).toBe(false);
      expect(r.canRemediate()).toBe(true);
    });
  });
});
