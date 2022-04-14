import { IdxAuthenticator } from '../../../../lib/idx/types';
import { SecurityQuestionAuthenticatorFactory } from '@okta/test.support/idx';
import { SecurityQuestionEnrollment } from '../../../../lib/idx/authenticator';

describe('idx/authenticator/SecurityQuestionEnrollment', () => {
  let testContext;
  beforeEach(() => {
    const idxAuthenticator: IdxAuthenticator = SecurityQuestionAuthenticatorFactory.build();
    const authenticator = new SecurityQuestionEnrollment(idxAuthenticator);
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
    it('cannot verify using only "answer"', () => {
      const { authenticator } = testContext;
      expect(authenticator.canVerify({ answer: 'foo' })).toBe(false);
    });
    it('can verify using "answer" and "questionKey"', () => {
      const { authenticator } = testContext;
      expect(authenticator.canVerify({ answer: 'foo', questionKey: 'bar' })).toBe(true);
    });
    it('canv erify using "answer" and "question"', () => {
      const { authenticator } = testContext;
      expect(authenticator.canVerify({ answer: 'foo', question: 'bar' })).toBe(true);
    });
    it('cannot verify using only "credentials.answer"', () => {
      const { authenticator } = testContext;
      expect(authenticator.canVerify({ credentials: { answer: 'foo' } })).toBe(false);
    });
    it('can verify using "credentials.answer" and "credentials.questionKey"', () => {
      const { authenticator } = testContext;
      expect(authenticator.canVerify({ credentials: { answer: 'foo', questionKey: 'bar' } })).toBe(true);
    });
  });

  describe('mapCredentials', () => {
    it('returns undefined by default', () => {
      const { authenticator } = testContext;
      expect(authenticator.mapCredentials({})).toBe(undefined);
    });
    it('returns undefined if only "answer" is set', () => {
      const { authenticator } = testContext;
      expect(authenticator.mapCredentials({ answer: 'foo' })).toBe(undefined);
    });
    it('returns a credentials object if "answer" and "question" is set', () => {
      const { authenticator } = testContext;
      expect(authenticator.mapCredentials({ answer: 'foo', question: 'what do?' })).toEqual({
        answer: 'foo',
        questionKey: 'custom',
        question: 'what do?'
      });
    });
    it('returns a credentials object if "answer" and "questionKey" is set', () => {
      const { authenticator } = testContext;
      expect(authenticator.mapCredentials({ answer: 'foo', questionKey: 'bar' })).toEqual({
        answer: 'foo',
        questionKey: 'bar',
      });
    });
  });

  describe('getInputs', () => {
    it('returns three inputs: questionKey, question, answer', () => {
      const { authenticator } = testContext;
      expect(authenticator.getInputs()).toEqual([
        { name: 'questionKey', type: 'string', required: true },
        { name: 'question', type: 'string', label: 'Create a security question' },
        { name: 'answer', type: 'string', label: 'Answer', required: true }
      ]);
    });
  });
});
