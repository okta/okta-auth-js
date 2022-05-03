import { IdxAuthenticator } from '../../../../lib/idx/types';
import { WebauthnAuthenticatorFactory } from '@okta/test.support/idx';
import { WebauthnVerification } from '../../../../lib/idx/authenticator';

const VALID_CREDS = {
  clientData: 'foo',
  authenticatorData: 'foo',
  signatureData:'foo',
};

describe('idx/authenticator/WebauthnEnrollment', () => {
  let testContext;
  beforeEach(() => {
    const idxAuthenticator: IdxAuthenticator = WebauthnAuthenticatorFactory.build();
    const authenticator = new WebauthnVerification(idxAuthenticator);
    testContext = {
      idxAuthenticator,
      authenticator
    };
  });

  describe('constructor', () => {
    it('sets the authenticator on the "meta" property', () => {
      const { idxAuthenticator, authenticator } = testContext;
      expect(authenticator.meta).toBe(idxAuthenticator);
    });
  });

  describe('canVerify', () => {
    it('by default, returns false', () => {
      const { authenticator } = testContext;
      expect(authenticator.canVerify({ unknownValue: 'foo' })).toBe(false);
    });
    it('canVerify using "credentials"', () => {
      const { authenticator } = testContext;
      expect(authenticator.canVerify({ credentials: {...VALID_CREDS} })).toBe(true);
    });
    it('canVerify without using "credentials"', () => {
      const { authenticator } = testContext;
      expect(authenticator.canVerify({...VALID_CREDS})).toBe(true);
    });
  });

  describe('mapCredentials', () => {
    it('returns undefined by default', () => {
      const { authenticator } = testContext;
      expect(authenticator.mapCredentials({})).toBe(undefined);
    });
    it('returns a credentials object when values passed via credentials', () => {
      const { authenticator } = testContext;
      expect(authenticator.mapCredentials({ credentials: {...VALID_CREDS} })).toEqual({...VALID_CREDS});
    });
    it('returns a credentials object when values passed directly', () => {
      const { authenticator } = testContext;
      expect(authenticator.mapCredentials({ ...VALID_CREDS })).toEqual({...VALID_CREDS});
    });
  });

  describe('getInputs', () => {
    it('returns one input: answer', () => {
      const { authenticator } = testContext;
      expect(authenticator.getInputs()).toEqual([
        { name: 'authenticatorData', type: 'string', label: 'Authenticator Data', required: true, visible: false },
        { name: 'clientData', type: 'string', label: 'Client Data', required: true, visible: false },
        { name: 'signatureData', type: 'string', label: 'Signature Data', required: true, visible: false },
      ]);
    });
  });
});
