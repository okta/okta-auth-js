define(function(require) {
  var OktaAuth = require('OktaAuth');
  var tokens = require('../util/tokens');

  describe('token.decode', function () {

    function setupSync() {
      return new OktaAuth({ url: 'http://example.okta.com' });
    }

    it('correctly decodes a token', function () {
      var oa = setupSync();
      var decodedToken = oa.token.decode(tokens.unicodeToken);
      expect(decodedToken).toDeepEqual(tokens.unicodeDecoded);
    });

    it('throws an error for a malformed token', function () {
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
});
