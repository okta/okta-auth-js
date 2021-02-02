import { OAuthError } from '../../../../lib/errors';
import { isInteractionRequiredError } from '../../../../lib/oidc/util';

describe('oidc/util/errors', () => {

  describe('isInteractionRequiredError', () => {
    it('returns true for OAuthError objects with "interaction_required" errorCode', () => {
      const error = new OAuthError('interaction_required', 'description not matter');
      expect(isInteractionRequiredError(error)).toBe(true);
    });

    it('returns false for OAuthError objects with errorCode other than "interaction_required"', () => {
      const error = new OAuthError('something', 'description not matter');
      expect(isInteractionRequiredError(error)).toBe(false);
    });

    it('returns false for non OAuthError objects', () => {
      const error = new Error('something');
      expect(isInteractionRequiredError(error)).toBe(false);
    });
  });
});