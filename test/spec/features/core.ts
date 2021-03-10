import { OktaAuth } from '@okta/okta-auth-js';

describe('features', function() {

  describe('functions exist', function() {
    var funcs = [
      'isBrowser',
      'isIE11OrLess',
      'getUserAgent',
      'isFingerprintSupported',
      'isPopupPostMessageSupported',
      'isTokenVerifySupported',
      'hasTextEncoder',
      'isPKCESupported',
      'isHTTPS',
      'isLocalhost'
    ];

    it('on prototype', function() {
      var auth = new OktaAuth({
        pkce: false,
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

});
