import {
  SelectAuthenticatorAuthenticate,
  SelectAuthenticatorEnroll,
  SelectAuthenticatorUnlockAccount
} from '../../../../lib/idx/remediators';
import {
  SelectAuthenticatorEnrollRemediationFactory,
  SelectAuthenticatorAuthenticateRemediationFactory,
  AuthenticatorValueFactory,
  PhoneAuthenticatorOptionFactory,
  EmailAuthenticatorOptionFactory,
  IdxContextFactory,
  PhoneAuthenticatorFactory,
  EmailAuthenticatorFactory,
  SelectAuthenticatorUnlockAccountRemediationFactory,
  SecurityQuestionAuthenticatorOptionFactory,
  IdxValueFactory,
} from '@okta/test.support/idx';

describe('remediators/Base/SelectAuthenticator', () => {
  describe('canRemediate', () => {
    it('retuns false if can\'t find matched authenticator by key', () => {
      const remediation = SelectAuthenticatorAuthenticateRemediationFactory.build({
        value: [
          AuthenticatorValueFactory.build({
            options: [
              PhoneAuthenticatorOptionFactory.params({
                // prevent resolving of authenticator by `relatesTo` on purpose
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

    // Fix for OKTA-646147
    it('retuns true if `options.step` is explicitly passed', () => {
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
      const r = new SelectAuthenticatorAuthenticate(remediation, { authenticators }, { step: 'select-authenticator-authenticate'});
      expect(r.canRemediate(context)).toBe(true);
      expect(r.canRemediate()).toBe(true);
    });
  });
});

describe('remediators/SelectAuthenticatorUnlockAccount', () => {
  describe('mapAuthenticator', () => {
    // TODO: return methodType 1

    // TODO: return methodType 2

    // TODO: return methodType 3

    // TODO: return no methodType
    fit('should not return a methodType value', () => {
      const phoneAuthenticatorValue = AuthenticatorValueFactory.build({
        options: [
          PhoneAuthenticatorOptionFactory.build(),
        ]
      });
      
      const remediation = SelectAuthenticatorUnlockAccountRemediationFactory.build({
        value: [
          phoneAuthenticatorValue
        ]
      });

      console.log(phoneAuthenticatorValue);
      console.log('##########')
      console.log(remediation);

      const r = new SelectAuthenticatorUnlockAccount(remediation);
      expect(r.mapAuthenticator(phoneAuthenticatorValue)).toBe(false);
    });
  });
});
