import { SelectAuthenticatorAuthenticate } from '../../../../lib/idx/remediators';
import {
  SelectAuthenticatorAuthenticateRemediationFactory,
  SelectAuthenticatorEnrollRemediationFactory,
  AuthenticatorValueFactory,
  PhoneAuthenticatorOptionFactory,
  IdxContextFactory,
  PhoneAuthenticatorFactory,
} from '@okta/test.support/idx';

describe('remediators/Base/SelectAuthenticator', () => {
  describe('canRemediate', () => {
    it('retuns false if can\'t find matched authenticator by key', () => {
      const remediation = SelectAuthenticatorAuthenticateRemediationFactory.build({
        value: [
          AuthenticatorValueFactory.build({
            options: [
              PhoneAuthenticatorOptionFactory.params({
                // prevent resolving of authenticator by `relatesTo` in purpose
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                _authenticator: 'cant_be_resolved' as any
              }).build(),
            ]
          })
        ]
      });

      const authenticators = [
        { id: 'foo' }
      ];
      const r = new SelectAuthenticatorAuthenticate(remediation, { authenticators });
      expect(r.canRemediate()).toBe(false);
    });

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
