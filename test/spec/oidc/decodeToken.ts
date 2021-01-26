import { OktaAuth } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';

function setupSync(options?) {
  options = Object.assign({ issuer: 'http://example.okta.com', pkce: false }, options);
  return new OktaAuth(options);
}


describe('token.decode', function() {

  it('correctly decodes a token', function() {
    var oa = setupSync();
    var decodedToken = oa.token.decode(tokens.unicodeToken);
    expect(decodedToken).toEqual(tokens.unicodeDecoded);
  });

  it('throws an error for a malformed token', function() {
    var oa = setupSync();
    try {
      oa.token.decode('malformedToken');
      // Should never hit this
      expect(true).toBe(false);
    } catch (e) {
      expect(e.name).toEqual('AuthSdkError');
      expect(e.errorSummary).toBeDefined();
    }
  });
});