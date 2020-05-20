/* global window */
jest.mock('cross-fetch');

var Emitter = require('tiny-emitter');
var OktaAuth = require('../../lib/browser/browserIndex');
var AuthApiError = require('../../lib/errors/AuthApiError');

describe('Browser', function() {
  let auth;
  let issuer;
  let originalLocation;

  afterEach(() => {
    window.location = originalLocation;
  });

  beforeEach(function() {
    originalLocation = window.location;
    delete window.location;
    /** @type {any} */(window).location = {
      protocol: 'https:',
      hostname: 'somesite.local'
    };

    issuer =  'http://my-okta-domain';
    auth = new OktaAuth({ issuer, pkce: false });
  });

  it('is a valid constructor', function() {
    expect(auth instanceof OktaAuth).toBe(true);
  });

  describe('Error handling', function() {
    it('Listens to error events from TokenManager', function() {
      jest.spyOn(Emitter.prototype, 'on');
      jest.spyOn(OktaAuth.prototype, '_onTokenManagerError');
      var auth = new OktaAuth({ issuer: 'http://localhost/fake', pkce: false });
      expect(Emitter.prototype.on).toHaveBeenCalledWith('error', auth._onTokenManagerError, auth);
      var emitter = /** @type {any} */(Emitter).prototype.on.mock.instances[0];
      var error = { errorCode: 'anything'};
      emitter.emit('error', error);
      expect(OktaAuth.prototype._onTokenManagerError).toHaveBeenCalledWith(error);
    });
  
    it('error with errorCode "login_required" and accessToken: true will call option "onSessionExpired" function', function() {
      var onSessionExpired = jest.fn();
      jest.spyOn(Emitter.prototype, 'on');
      new OktaAuth({ issuer: 'http://localhost/fake', pkce: false, onSessionExpired: onSessionExpired });
      var emitter = /** @type {any} */(Emitter).prototype.on.mock.instances[0];
      expect(onSessionExpired).not.toHaveBeenCalled();
      var error = { errorCode: 'login_required', accessToken: true };
      emitter.emit('error', error);
      expect(onSessionExpired).toHaveBeenCalled();
    });

    it('error with errorCode "login_required" (not accessToken) does not call option "onSessionExpired" function', function() {
      var onSessionExpired = jest.fn();
      jest.spyOn(Emitter.prototype, 'on');
      new OktaAuth({ issuer: 'http://localhost/fake', pkce: false, onSessionExpired: onSessionExpired });
      var emitter = /** @type {any} */(Emitter).prototype.on.mock.instances[0];
      expect(onSessionExpired).not.toHaveBeenCalled();
      var error = { errorCode: 'login_required' };
      emitter.emit('error', error);
      expect(onSessionExpired).not.toHaveBeenCalled();
    });
    
    it('error with unknown errorCode does not call option "onSessionExpired" function', function() {
      var onSessionExpired = jest.fn();
      jest.spyOn(Emitter.prototype, 'on');
      new OktaAuth({ issuer: 'http://localhost/fake', pkce: false, onSessionExpired: onSessionExpired });
      var emitter = /** @type {any} */(Emitter).prototype.on.mock.instances[0];
      expect(onSessionExpired).not.toHaveBeenCalled();
      var error = { errorCode: 'unknown', accessToken: true };
      emitter.emit('error', error);
      expect(onSessionExpired).not.toHaveBeenCalled();
    });
  });

  describe('options', function() {
    describe('cookies', () => {

      it('"secure" is true by default', () => {
        expect(auth.options.cookies.secure).toBe(true);
      });

      it('"sameSite" is "none" by default', () => {
        expect(auth.options.cookies.sameSite).toBe('none');
      });

      it('"sameSite" is "lax" if secure is false', () => {
        auth = new OktaAuth({ issuer, pkce: false, cookies: { secure: false }});
        expect(auth.options.cookies.sameSite).toBe('lax');
      });

      it('"secure" is forced to false if running on http://localhost', () => {
        window.location.protocol = 'http:';
        window.location.hostname = 'localhost';
        auth = new OktaAuth({ issuer, pkce: false, cookies: { secure: true }});
        expect(auth.options.cookies.secure).toBe(false);
        expect(auth.options.cookies.sameSite).toBe('lax');
      });

      it('console warning if running on HTTP (not localhost)', () => {
        window.location.protocol = 'http:';
        window.location.hostname = 'not-localhost';
        jest.spyOn(console, 'warn').mockReturnValue(null);
        auth = new OktaAuth({ issuer: 'http://my-okta-domain' });
        
        // eslint-disable-next-line no-console
        expect(console.warn).toHaveBeenCalledWith(
          'The current page is not being served with the HTTPS protocol.\n' +
          'For security reasons, we strongly recommend using HTTPS.\n' +
          'If you cannot use HTTPS, set "cookies.secure" option to false.'
        );
      });

      it('does not throw if running on HTTP and cookies.secure = false', () => {
        window.location.protocol = 'http:';
        window.location.hostname = 'not-localhost';
        function fn() {
          auth = new OktaAuth({ cookies: { secure: false }, issuer: 'http://my-okta-domain', pkce: false });
        }
        expect(fn).not.toThrow();
      });

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
    })
  });

  describe('revokeAccessToken', function() {
    it('will read from TokenManager and call token.revoke', function() {
      var accessToken = { accessToken: 'fake' };
      spyOn(auth.tokenManager, 'get').and.returnValue(Promise.resolve(accessToken));
      spyOn(auth.token, 'revoke').and.returnValue(Promise.resolve());
      return auth.revokeAccessToken()
        .then(function() {
          expect(auth.tokenManager.get).toHaveBeenCalledWith('accessToken');
          expect(auth.token.revoke).toHaveBeenCalledWith(accessToken);
        });
    });
    it('will throw if token.revoke rejects with unknown error', function() {
      var accessToken = { accessToken: 'fake' };
      spyOn(auth.tokenManager, 'get').and.returnValue(Promise.resolve(accessToken));
      var testError = new Error('test error');
      spyOn(auth.token, 'revoke').and.callFake(function() {
        return Promise.reject(testError);
      });
      return auth.revokeAccessToken()
        .catch(function(e) {
          expect(e).toBe(testError);
        });
    });
    it('can pass an access token object to bypass TokenManager', function() {
      var accessToken = { accessToken: 'fake' };
      spyOn(auth.token, 'revoke').and.returnValue(Promise.resolve());
      spyOn(auth.tokenManager, 'get');
      return auth.revokeAccessToken(accessToken)
        .then(function() {
          expect(auth.tokenManager.get).not.toHaveBeenCalled();
          expect(auth.token.revoke).toHaveBeenCalledWith(accessToken);
        });
    });
    it('if accessToken cannot be located, will resolve without error', function() {
      spyOn(auth.token, 'revoke').and.returnValue(Promise.resolve());
      spyOn(auth.tokenManager, 'get').and.returnValue(Promise.resolve())
      return auth.revokeAccessToken()
        .then(() => {
          expect(auth.tokenManager.get).toHaveBeenCalled();
          expect(auth.token.revoke).not.toHaveBeenCalled();
        });
    });
  });

  describe('closeSession', function() {
    it('Default options: clears TokenManager, closes session', function() {
      spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
      spyOn(auth.tokenManager, 'clear');
      return auth.closeSession()
        .then(function() {
          expect(auth.tokenManager.clear).toHaveBeenCalled();
          expect(auth.session.close).toHaveBeenCalled();
        });
    });
    it('catches and absorbs "AuthApiError" errors with errorCode E0000007 (RESOURCE_NOT_FOUND_EXCEPTION)', function() {
      var testError = new AuthApiError({ errorCode: 'E0000007' });
      spyOn(auth.session, 'close').and.callFake(function() {
        return Promise.reject(testError);
      });
      return auth.closeSession()
      .then(function() {
        expect(auth.session.close).toHaveBeenCalled();
      });
    });
    it('will throw unknown errors', function() {
      var testError = new Error('test error');
      spyOn(auth.session, 'close').and.callFake(function() {
        return Promise.reject(testError);
      });
      return auth.closeSession()
      .catch(function(e) {
        expect(e).toBe(testError);
      });
    });
  });

  describe('signOut', function() {
    let origin;
    let encodedOrigin;
  
    beforeEach(function() {
      origin = 'https://somesite.local';
      encodedOrigin = encodeURIComponent(origin);
      Object.assign(window.location, {
        origin,
        assign: jest.fn(),
        reload: jest.fn()
      });
    });

    describe('with idToken and accessToken', () => {
      let idToken;
      let accessToken;

      function initSpies() {
        spyOn(auth.tokenManager, 'get').and.callFake(key => {
          if (key === 'idToken') {
            return idToken;
          } else if (key === 'token') {
            return accessToken;
          } else {
            throw new Error(`Unknown token key: ${key}`);
          }
        });
        spyOn(auth.tokenManager, 'clear');
        spyOn(auth, 'revokeAccessToken').and.returnValue(Promise.resolve());
        spyOn(auth, 'closeSession').and.returnValue(Promise.resolve());
      }

      beforeEach(() => {
        accessToken = { accessToken: 'fake' };
        idToken = { idToken: 'fake' };
        initSpies();
      });

      it('Default options: will revokeAccessToken and use window.location.href for postLogoutRedirectUri', function() {
        return auth.signOut()
          .then(function() {
            expect(auth.tokenManager.get).toHaveBeenNthCalledWith(1, 'idToken');
            expect(auth.tokenManager.get).toHaveBeenNthCalledWith(2, 'token');
            expect(auth.revokeAccessToken).toHaveBeenCalledWith(accessToken);
            expect(auth.tokenManager.clear).toHaveBeenCalled();
            expect(auth.closeSession).not.toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${idToken.idToken}&post_logout_redirect_uri=${encodedOrigin}`);
          });
      });

      it('supports custom authorization server', function() {
        issuer = 'http://my-okta-domain/oauth2/custom-as';
        auth = new OktaAuth({
          pkce: false,
          issuer
        });
        initSpies();
        return auth.signOut()
          .then(function() {
            expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/v1/logout?id_token_hint=${idToken.idToken}&post_logout_redirect_uri=${encodedOrigin}`);
          });
      });

      it('if idToken is passed, will skip token manager read', function() {
        var customToken = { idToken: 'fake-custom' };
        return auth.signOut({ idToken: customToken })
          .then(function() {
            expect(auth.tokenManager.get).toHaveBeenCalledTimes(1);
            expect(auth.tokenManager.get).toHaveBeenNthCalledWith(1, 'token');
            expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${customToken.idToken}&post_logout_redirect_uri=${encodedOrigin}`);
          });
      });
  
      it('if idToken=false will skip token manager read and call closeSession', function() {
        return auth.signOut({ idToken: false })
          .then(function() {
            expect(auth.tokenManager.get).toHaveBeenCalledTimes(1);
            expect(auth.tokenManager.get).toHaveBeenNthCalledWith(1, 'token');
            expect(auth.closeSession).toHaveBeenCalled();
            expect(window.location.reload).toHaveBeenCalled();
          });
      });
  
      describe('postLogoutRedirectUri', function() {
        it('can be set by config', function() {
          const postLogoutRedirectUri = 'http://someother';
          const encodedUri = encodeURIComponent(postLogoutRedirectUri);
          auth = new OktaAuth({
            pkce: false,
            issuer,
            postLogoutRedirectUri
          });
          initSpies();
          return auth.signOut()
            .then(function() {
              expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${idToken.idToken}&post_logout_redirect_uri=${encodedUri}`);
            });
        });
        it('can be passed as an option', function() {
          const postLogoutRedirectUri = 'http://someother';
          const encodedUri = encodeURIComponent(postLogoutRedirectUri);
          return auth.signOut({ postLogoutRedirectUri })
            .then(function() {
              expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${idToken.idToken}&post_logout_redirect_uri=${encodedUri}`);
            });
        });
      });

      it('Can pass a "state" option', function() {
        const state = 'foo=bar&yo=me';
        const encodedState = encodeURIComponent(state);
        return auth.signOut({ state })
          .then(function() {
            expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${idToken.idToken}&post_logout_redirect_uri=${encodedOrigin}&state=${encodedState}`);
          });
      });

      it('Can pass a "revokeAccessToken=false" to skip accessToken logic', function() {
        return auth.signOut({ revokeAccessToken: false })
          .then(function() {
            expect(auth.tokenManager.get).toHaveBeenCalledTimes(1);
            expect(auth.tokenManager.get).toHaveBeenNthCalledWith(1, 'idToken');
            expect(auth.revokeAccessToken).not.toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${idToken.idToken}&post_logout_redirect_uri=${encodedOrigin}`);
          });
      });

      it('Can pass a "accessToken=false" to skip accessToken logic', function() {
        return auth.signOut({ accessToken: false })
          .then(function() {
            expect(auth.tokenManager.get).toHaveBeenCalledTimes(1);
            expect(auth.tokenManager.get).toHaveBeenNthCalledWith(1, 'idToken');
            expect(auth.revokeAccessToken).not.toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${idToken.idToken}&post_logout_redirect_uri=${encodedOrigin}`);
          });
      });
    });

    describe('without idToken', () => {
      let accessToken;

      beforeEach(() => {
        accessToken = { accessToken: 'fake' };
        spyOn(auth.tokenManager, 'get').and.callFake(key => {
          if (key === 'idToken') {
            return;
          } else if (key === 'token') {
            return accessToken;
          } else {
            throw new Error(`Unknown token key: ${key}`);
          }
        });        
        spyOn(auth.tokenManager, 'clear');
        spyOn(auth, 'revokeAccessToken').and.returnValue(Promise.resolve());
      });

      it('Default options: will revokeAccessToken and fallback to closeSession and window.location.reload()', function() {
        spyOn(auth, 'closeSession').and.returnValue(Promise.resolve());
        return auth.signOut()
          .then(function() {
            expect(auth.tokenManager.get).toHaveBeenNthCalledWith(1, 'idToken');
            expect(auth.tokenManager.get).toHaveBeenNthCalledWith(2, 'token');
            expect(auth.revokeAccessToken).toHaveBeenCalledWith(accessToken);
            expect(auth.tokenManager.clear).toHaveBeenCalled();
            expect(auth.closeSession).toHaveBeenCalled();
            expect(window.location.reload).toHaveBeenCalled();
          });
      });

      it('Default options: will throw exceptions from closeSession and not call window.location.reload', function() {
        const testError = new Error('test error');
        spyOn(auth, 'closeSession').and.callFake(function() {
          return Promise.reject(testError);
        });
        return auth.signOut()
          .then(function() {
            expect(false).toBe(true);
          })
          .catch(function(e) {
            expect(e).toBe(testError);
            expect(auth.closeSession).toHaveBeenCalled();
            expect(window.location.reload).not.toHaveBeenCalled();
          });
      });

      it('with postLogoutRedirectUri: will call window.location.assign', function() {
        const postLogoutRedirectUri = 'http://someother';
        spyOn(auth, 'closeSession').and.returnValue(Promise.resolve());
        return auth.signOut({ postLogoutRedirectUri })
          .then(function() {
            expect(window.location.assign).toHaveBeenCalledWith(postLogoutRedirectUri);
          });
      });

      it('with postLogoutRedirectUri: will throw exceptions from closeSession and not call window.location.assign', function() {
        const postLogoutRedirectUri = 'http://someother';
        const testError = new Error('test error');
        spyOn(auth, 'closeSession').and.callFake(function() {
          return Promise.reject(testError);
        });
        return auth.signOut({ postLogoutRedirectUri })
          .then(function() {
            expect(false).toBe(true);
          })
          .catch(function(e) {
            expect(e).toBe(testError);
            expect(auth.closeSession).toHaveBeenCalled();
            expect(window.location.assign).not.toHaveBeenCalled();
          });
      });
    });

    describe('without accessToken', () => {
      let idToken;
      beforeEach(() => {
        idToken = { idToken: 'fake' };
        spyOn(auth.tokenManager, 'get').and.callFake(key => {
          if (key === 'idToken') {
            return idToken;
          } else if (key === 'token') {
            return;
          } else {
            throw new Error(`Unknown token key: ${key}`);
          }
        });
        spyOn(auth.tokenManager, 'clear');
        spyOn(auth, 'revokeAccessToken').and.returnValue(Promise.resolve());
      });

      it('Default options: will not revoke accessToken', () => {
        return auth.signOut()
        .then(function() {
          expect(auth.revokeAccessToken).not.toHaveBeenCalled();
          expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${idToken.idToken}&post_logout_redirect_uri=${encodedOrigin}`);
        });
      });

      it('Can pass an accessToken', () => {
        const accessToken = { accessToken: 'custom-fake' };
        return auth.signOut({ accessToken })
        .then(function() {
          expect(auth.revokeAccessToken).toHaveBeenCalledWith(accessToken);
          expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${idToken.idToken}&post_logout_redirect_uri=${encodedOrigin}`);
        });
      });
    });

  });

});