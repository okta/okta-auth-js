define(function(require) {
  var OktaAuth = require('OktaAuth');
  var Q = require('q');
  var tokens = require('../util/tokens');

  describe('token.decode', function () {

    function setup() {
      return Q.resolve(new OktaAuth({
        url: 'http://example.okta.com'
      }));
    }

    it('correctly decodes a token', function (done) {
      return setup()
      .then(function (oa) {
        var decodedToken = oa.token.decode(tokens.unicodeToken);
        expect(decodedToken).toDeepEqual(tokens.unicodeDecoded);
        done();
      });
    });

    it('throws an error for a malformed token', function (done) {
      return setup()
      .then(function (oa) {
        return oa.token.decode('malformedToken');
      })
      .then(function (res) {
        // Should never hit this
        expect(res).toBeNull();
        done();
      })
      .fail(function (err) {
        expect(err.name).toEqual('AuthSdkError');
        expect(err.errorSummary).toEqual('Malformed token');
        done();
      });
    });
  });
});
