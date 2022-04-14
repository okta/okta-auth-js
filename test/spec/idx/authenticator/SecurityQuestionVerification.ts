import { IdxAuthenticator } from '../../../../lib/idx/types';
import { SecurityQuestionAuthenticatorFactory } from '@okta/test.support/idx';
import { SecurityQuestionVerification } from '../../../../lib/idx/authenticator';

describe('idx/authenticator/SecurityQuestionVerification', () => {
  let testContext;
  beforeEach(() => {
    const idxAuthenticator: IdxAuthenticator = SecurityQuestionAuthenticatorFactory.build();
    const authenticator = new SecurityQuestionVerification(idxAuthenticator);
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
    it('canVerify using "answer"', () => {
      const { authenticator } = testContext;
      expect(authenticator.canVerify({ answer: 'foo' })).toBe(true);
    });
    it('canVerify using "credentials.answer"', () => {
      const { authenticator } = testContext;
      expect(authenticator.canVerify({ credentials: { answer: 'foo' } })).toBe(true);
    });
  });

  describe('mapCredentials', () => {
    it('returns undefined by default', () => {
      const { authenticator } = testContext;
      expect(authenticator.mapCredentials({})).toBe(undefined);
    });
    it('returns a credentials object if "answer" is set', () => {
      const { authenticator, idxAuthenticator } = testContext;
      expect(idxAuthenticator.contextualData.enrolledQuestion.questionKey).toBe('custom');
      expect(authenticator.mapCredentials({ answer: 'foo' })).toEqual({
        answer: 'foo',
        questionKey: 'custom'
      });
    });
  });

  describe('getInputs', () => {
    it('returns one input: answer', () => {
      const { authenticator } = testContext;
      expect(authenticator.getInputs()).toEqual([
        { name: 'answer', type: 'string', label: 'Answer', required: true }
      ]);
    });
  });
});
