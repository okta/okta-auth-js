import { 
  OktaAuth
} from '@okta/okta-auth-js';

describe('OktaAuth - options', function() {
  let auth;
  let issuer;

  beforeEach(function() {
    issuer =  'http://my-okta-domain';
    auth = new OktaAuth({ issuer, pkce: false });
  });

  describe('PKCE', function() {

    it('is true by default', function() {
      spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
      auth = new OktaAuth({ issuer });
      expect(auth.options.pkce).toBe(true);
    });

    it('can be set to "false" by arg', function() {
      auth = new OktaAuth({ pkce: false, issuer: 'http://my-okta-domain' });
      expect(auth.options.pkce).toBe(false);
    });
  });

  describe('getToken options', function() {
    it('responseType is undefined by default', function() {
      expect(auth.options.responseType).toBeUndefined();
    });
    it('can set responseType', function() {
      auth = new OktaAuth({ issuer, responseType: 'code' });
      expect(auth.options.responseType).toBe('code');
    });
    it('scopes is undefined by default', function() {
      expect(auth.options.scopes).toBeUndefined();
    });
    it('can set scopes', function() {
      auth = new OktaAuth({ issuer, scopes: ['fake', 'scope']});
      expect(auth.options.scopes).toEqual(['fake', 'scope']);
    });
  });
});
