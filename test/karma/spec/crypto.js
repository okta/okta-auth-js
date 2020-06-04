import tokens from '@okta/test.support/tokens';
import factory from '@okta/test.support/factory';
import * as sdkCrypto from '../../../lib/crypto';
import sdkUtil from '../../../lib/util';

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

  describe('verifyToken', function() {

    it('succeeds with known good token and key', function() {
      var idToken = tokens.standardIdToken;
      var key = tokens.standardKey;
      return sdkCrypto.verifyToken(idToken, key)
      .then(function(res) {
        expect(res).toBe(true);
      });
    });

    it('fails with a bad token', function() {
      var ISSUER = 'http://example.okta.com';
      var CLIENT_ID = 'fake';  
      var idToken = factory.buildIDToken({
        issuer: ISSUER,
        clientId: CLIENT_ID
      });
      var key = tokens.standardKey;
      return sdkCrypto.verifyToken(idToken, key)
        .then(function(res) {
          expect(res).toBe(false);
        });
    });

    it('fails with a bad key', function() {
      var idToken = tokens.standardIdToken;
      var key = Object.assign({}, tokens.standardKey, {
        n: sdkUtil.stringToBase64Url('bad key value')
      });
      return sdkCrypto.verifyToken(idToken, key)
        .then(function(res) {
          expect(res).toBe(false);
        });
    });
  });
});
