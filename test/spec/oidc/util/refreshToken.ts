import { isRefreshTokenError } from '../../../../lib/oidc/util/refreshToken';
import { AuthApiError } from '../../../../lib/errors';

describe('refreshToken', () => {

  describe('isRefreshTokenError', () => {

    it('returns true for an invalid_grant error', () => {
      const xhr = {
        status: 400,
        responseText: 'does not matter',
        responseJSON: {
          error: 'invalid_grant'
        }
      };
      const error = new AuthApiError({
        errorSummary: 'does not matter'
      }, xhr);

      expect(isRefreshTokenError(error)).toBe(true);
    });
  });

  it('returns false for other AuthApi errors', () => {
    const xhr = {
      status: 400,
      responseText: 'does not matter',
      responseJSON: {
        error: 'something else'
      }
    };
    const error = new AuthApiError({
      errorSummary: 'does not matter'
    }, xhr);

    expect(isRefreshTokenError(error)).toBe(false);
  });


  it('returns false for non AuthApi errors', () => {
    const error = new Error('not a refresh token error');
    expect(isRefreshTokenError(error)).toBe(false);
  });

});
