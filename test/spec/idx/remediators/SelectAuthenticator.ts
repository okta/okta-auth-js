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
  ResendAuthenticatorFactory
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
  });
});

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

    it('returns true if matched authenticator has a resend form', () => {
      const phoneAuthenticator = PhoneAuthenticatorFactory.build();
      const remediation = SelectAuthenticatorAuthenticateRemediationFactory.build({
        value: [
          AuthenticatorValueFactory.build({
            options: [
              PhoneAuthenticatorOptionFactory.params({
                _authenticator: phoneAuthenticator,
              }).build(),
            ]
          }),
        ]
      });
      const context = IdxContextFactory.build({
        currentAuthenticatorEnrollment: {
          value: {
            ...phoneAuthenticator,
            resend: ResendAuthenticatorFactory.build(),
          }
        },
        authenticatorEnrollments: {
          value: [phoneAuthenticator]
        },
        currentAuthenticator: {}
      });

      const authenticators = [
        phoneAuthenticator,
      ];
      const r = new SelectAuthenticatorAuthenticate(remediation, { authenticators });
      expect(r.canRemediate(context)).toBe(true);
      expect(r.canRemediate()).toBe(true);
    });
  });
});
