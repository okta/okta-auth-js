import { IdxAuthenticator } from '../../../../lib/idx/types';
import { WebauthnAuthenticatorFactory } from '@okta/test.support/idx';
import { WebauthnEnrollment } from '../../../../lib/idx/authenticator';

describe('idx/authenticator/WebauthnEnrollment', () => {
  let testContext;
  beforeEach(() => {
    const idxAuthenticator: IdxAuthenticator = WebauthnAuthenticatorFactory.build();
    const authenticator = new WebauthnEnrollment(idxAuthenticator);
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
      expect(authenticator.canVerify({ credentials: { attestation: 'foo', clientData: 'foo' } })).toBe(true);
    });
    it('canVerify without using "credentials"', () => {
      const { authenticator } = testContext;
      expect(authenticator.canVerify({ attestation: 'foo', clientData: 'foo' })).toBe(true);
    });
  });

  describe('mapCredentials', () => {
    it('returns undefined by default', () => {
      const { authenticator } = testContext;
      expect(authenticator.mapCredentials({})).toBe(undefined);
    });
    it('returns a credentials object when values passed via credentials', () => {
      const { authenticator } = testContext;
      expect(authenticator.mapCredentials({ credentials: { attestation: 'foo', clientData: 'foo' } })).toEqual({
        attestation: 'foo', 
        clientData: 'foo'
      });
    });
    it('returns a credentials object when values passed directly', () => {
      const { authenticator } = testContext;
      expect(authenticator.mapCredentials({ attestation: 'foo', clientData: 'foo' })).toEqual({
        attestation: 'foo', 
        clientData: 'foo'
      });
    });
  });

  describe('getInputs', () => {
    it('returns one input: answer', () => {
      const { authenticator } = testContext;
      expect(authenticator.getInputs()).toEqual([
        { name: 'clientData', type: 'string', required: true, visible: false, label: 'Client Data' },
        { name: 'attestation', type: 'string', required: true, visible: false, label: 'Attestation' },
      ]);
    });
  });
});
