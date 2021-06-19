import { validateToken } from '../../../../lib/oidc/util';

describe('validateToken', function () {
  let testContext;

  beforeEach(function() {
    testContext = {
      // "valid" tokens
      idToken: {
        idToken: true
      },
      accessToken: {
        accessToken: true
      },
      refreshToken: {
        refreshToken: true
      },
      invalidToken: {
        foo: true
      }
    };
  });

  describe('no tokenType', () => {
    it('does not throw for a valid ID token', () => {
      expect(validateToken.bind(null, testContext.idToken)).not.toThrow();
    });
    it('does not throw for a valid access token', () => {
      expect(validateToken.bind(null, testContext.accessToken)).not.toThrow();
    });
    it('does not throw for a valid refresh token', () => {
      expect(validateToken.bind(null, testContext.refreshToken)).not.toThrow();
    });
    it('throws for an invalid token', () => {
      expect(validateToken.bind(null, testContext.fooToken)).toThrowError(
        'Token must be an Object with scopes, expiresAt, and one of: an idToken, accessToken, or refreshToken property'
      );
    });
  });
  describe('with tokenType', () => {
    describe('idToken', () => {
      it('does not throw for a valid ID token', () => {
        expect(validateToken.bind(null, testContext.idToken, 'idToken')).not.toThrow();
      });
      it('throws for an invalid token', () => {
        expect(validateToken.bind(null, testContext.fooToken, 'idToken')).toThrowError(
          'Token must be an Object with scopes, expiresAt, and one of: an idToken, accessToken, or refreshToken property'
        );
      });
      it('throws if accessToken is passed', () => {
        expect(validateToken.bind(null, testContext.accessToken, 'idToken')).toThrowError(
          'invalid idToken'
        );
      });
      it('throws if refreshToken is passed', () => {
        expect(validateToken.bind(null, testContext.refreshToken, 'idToken')).toThrowError(
          'invalid idToken'
        );
      });
    });
    describe('accessToken', () => {
      it('does not throw for a valid access token', () => {
        expect(validateToken.bind(null, testContext.accessToken, 'accessToken')).not.toThrow();
      });
      it('throws for an invalid token', () => {
        expect(validateToken.bind(null, testContext.fooToken, 'accessToken')).toThrowError(
          'Token must be an Object with scopes, expiresAt, and one of: an idToken, accessToken, or refreshToken property'
        );
      });
      it('throws if idToken is passsed', () => {
        expect(validateToken.bind(null, testContext.idToken, 'accessToken')).toThrowError(
          'invalid accessToken'
        );
      });
      it('throws if refreshToken is passsed', () => {
        expect(validateToken.bind(null, testContext.refreshToken, 'accessToken')).toThrowError(
          'invalid accessToken'
        );
      });
    });
    describe('refreshToken', () => {
      it('does not throw for a valid refresh token', () => {
        expect(validateToken.bind(null, testContext.refreshToken, 'refreshToken')).not.toThrow();
      });
      it('throws for an invalid token', () => {
        expect(validateToken.bind(null, testContext.fooToken, 'refreshToken')).toThrowError(
          'Token must be an Object with scopes, expiresAt, and one of: an idToken, accessToken, or refreshToken property'
        );
      });
      it('throws if idToken is passed', () => {
        expect(validateToken.bind(null, testContext.idToken, 'refreshToken')).toThrowError(
          'invalid refreshToken'
        );
      });
      it('throws if accessToken is passed', () => {
        expect(validateToken.bind(null, testContext.accessToken, 'refreshToken')).toThrowError(
          'invalid refreshToken'
        );
      });
    });
  });
});
