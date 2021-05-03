import * as sdkCrypto from '../../../lib/crypto';

describe('crypto', function() {
  describe('getOidcHash', () => {
    it('produces the correct value', () => {
      // Values are taken from OAuth2JWTTokenServiceImplUnitTest in okta-core
      return sdkCrypto.getOidcHash('dNZX1hEZ9wBCzNL40Upu646bdzQA')
        .then(atHash => {
          expect(atHash).toBe('wfgvmE9VxjAudsl9lc6TqA');
        });
    });
  });

});
