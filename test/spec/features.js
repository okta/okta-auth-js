var OktaAuth = require('OktaAuth');

describe('features', function() {

  describe('functions exist', function() {
    var funcs = [
      'isPopupPostMessageSupported',
      'isTokenVerifySupported',
      'isPKCESupported',
    ]

    it('on prototype', function() {
      var auth = new OktaAuth({
        issuer: 'https://fakeo'
      });

      funcs.forEach(function(fname)  {
        var fn = auth.features[fname];
        expect(typeof fn).toBe('function');
      });
    });
  
    it('on static type', function()  {
      funcs.forEach(function(fname) {
        var fn = OktaAuth.features[fname];
        expect(typeof fn).toBe('function');
      });
    });
  });

  describe('isPopupPostMessageSupported', function() {

    it('can succeed', function() {
      expect(OktaAuth.features.isPopupPostMessageSupported()).toBe(true);
    })

    it('not supported in IE < 10', function() {
      document.documentMode = 9;
      expect(OktaAuth.features.isPopupPostMessageSupported()).toBe(false);
    })

  });

  describe('isTokenVerifySupported', function() {
    beforeEach(function() {
      window.crypto = {
        subtle: true
      };
      window.Uint8Array = true;
    });

    it('can succeed', function() {
      expect(OktaAuth.features.isTokenVerifySupported()).toBe(true);
    })

    it('fails if no crypto', function() {
      window.crypto = undefined;
      expect(OktaAuth.features.isTokenVerifySupported()).toBe(false);
    });

    it('fails if no Uint8Array', function() {
      window.Uint8Array = undefined;
      expect(OktaAuth.features.isTokenVerifySupported()).toBe(false);
    });
  });


  describe('isPKCESupported', function() {
    beforeEach(function() {
      window.crypto = {
        subtle: true
      };
      window.Uint8Array = true;
    });

    it('can succeed', function() {
      expect(OktaAuth.features.isPKCESupported()).toBe(true);
    })

    it('fails if no crypto', function() {
      window.crypto = undefined;
      expect(OktaAuth.features.isPKCESupported()).toBe(false);
    });

    it('fails if no Uint8Array', function() {
      window.Uint8Array = undefined;
      expect(OktaAuth.features.isPKCESupported()).toBe(false);
    });


    it('throw an error during construction if pkce is true and PKCE is not supported', function () {
      var err;
      spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(false);
      try {
        new OktaAuth({
          url: 'https://dev-12345.oktapreview.com',
          pkce: true,
        });
      } catch (e) {
        err = e;
      }
      expect(err.name).toEqual('AuthSdkError');
      expect(err.errorSummary).toEqual('This browser doesn\'t support PKCE');
    });

  });
});
