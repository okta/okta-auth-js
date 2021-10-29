import { isEmailVerifyCallback, parseEmailVerifyCallback, EmailVerifyCallbackResponse } from '../../../lib/util/emailVerify';



describe('emailVerify', () => {

  describe('isEmailVerifyCallback', () => {
    it('by default, it returns false', () => {
      expect(isEmailVerifyCallback('foo=bar')).toBe(false);
    });
    it('returns false if only state exist', () => {
      expect(isEmailVerifyCallback('state=a&foo=bar')).toBe(false);
    });
    it('returns false if only stateTokenExternalId exist', () => {
      expect(isEmailVerifyCallback('stateTokenExternalId=a&foo=bar')).toBe(false);
    });
    it('returns true if both state and stateTokenExternalId exist', () => {
      expect(isEmailVerifyCallback('state=a&stateTokenExternalId=b')).toBe(true);
    });
  });

  describe('parseEmailVerifyCallback', () => {
    it('returns an empty object by default', () => {
      const res: EmailVerifyCallbackResponse = parseEmailVerifyCallback('');
      expect(res).toEqual({});
    });
    it('returns state and stateTokenExternalId from a url path passed as a parameter', () => {
      expect(parseEmailVerifyCallback('state=a&stateTokenExternalId=b')).toEqual({
        state: 'a',
        stateTokenExternalId: 'b'
      });
    });
  });
});