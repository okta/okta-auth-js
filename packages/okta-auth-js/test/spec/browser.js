var OktaAuth = require('../../lib/browser/browserIndex');


describe('Browser', function() {


  it('is a valid constructor', function() {
    var auth = new OktaAuth({ url: 'http://localhost/fake' });
    expect(auth instanceof OktaAuth).toBe(true);
  });

  describe('options', function() {
    var auth;
    beforeEach(function() {
      auth = new OktaAuth({ url: 'http://localhost/fake' });
    });

    describe('PKCE', function() {

      it('is false by default', function() {
        expect(auth.options.pkce).toBe(false);
      });

      it('can be set by arg', function() {
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
        auth = new OktaAuth({ pkce: true, url: 'http://localhost/fake' });
        expect(auth.options.pkce).toBe(true);
      });

      it('accepts alias "grantType"', function() {
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
        auth = new OktaAuth({ grantType: "authorization_code", url: 'http://localhost/fake' });
        expect(auth.options.pkce).toBe(true);
      });

      it('throws if PKCE is not supported', function() {
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(false);
        function fn() {
          auth = new OktaAuth({ pkce: true, url: 'http://localhost/fake' });
        }
        expect(fn).toThrowError('This browser doesn\'t support PKCE');
      });
    })
  });
});