jest.mock('cross-fetch');

var Emitter = require('tiny-emitter');
var OktaAuth = require('../../lib/browser/browserIndex');
var AuthApiError = require('../../lib/errors/AuthApiError');

describe('Browser', function() {
  var auth;
  beforeEach(function() {
    auth = new OktaAuth({ url: 'http://my-okta-domain' });
  });

  it('is a valid constructor', function() {
    expect(auth instanceof OktaAuth).toBe(true);
  });

  describe('Error handling', function() {
    it('Listens to error events from TokenManager', function() {
      jest.spyOn(Emitter.prototype, 'on');
      jest.spyOn(OktaAuth.prototype, '_onTokenManagerError');
      var auth = new OktaAuth({ url: 'http://localhost/fake' });
      expect(Emitter.prototype.on).toHaveBeenCalledWith('error', auth._onTokenManagerError, auth);
      var emitter = Emitter.prototype.on.mock.instances[0];
      var error = { errorCode: 'anything'};
      emitter.emit('error', error);
      expect(OktaAuth.prototype._onTokenManagerError).toHaveBeenCalledWith(error);
    });
  
    it('error with errorCode "login_required" and accessToken: true will call option "onSessionExpired" function', function() {
      var onSessionExpired = jest.fn();
      jest.spyOn(Emitter.prototype, 'on');
      new OktaAuth({ url: 'http://localhost/fake', onSessionExpired: onSessionExpired });
      var emitter = Emitter.prototype.on.mock.instances[0];
      expect(onSessionExpired).not.toHaveBeenCalled();
      var error = { errorCode: 'login_required', accessToken: true };
      emitter.emit('error', error);
      expect(onSessionExpired).toHaveBeenCalled();
    });

    it('error with errorCode "login_required" (not accessToken) does not call option "onSessionExpired" function', function() {
      var onSessionExpired = jest.fn();
      jest.spyOn(Emitter.prototype, 'on');
      new OktaAuth({ url: 'http://localhost/fake', onSessionExpired: onSessionExpired });
      var emitter = Emitter.prototype.on.mock.instances[0];
      expect(onSessionExpired).not.toHaveBeenCalled();
      var error = { errorCode: 'login_required' };
      emitter.emit('error', error);
      expect(onSessionExpired).not.toHaveBeenCalled();
    });
    
    it('error with unknown errorCode does not call option "onSessionExpired" function', function() {
      var onSessionExpired = jest.fn();
      jest.spyOn(Emitter.prototype, 'on');
      new OktaAuth({ url: 'http://localhost/fake', onSessionExpired: onSessionExpired });
      var emitter = Emitter.prototype.on.mock.instances[0];
      expect(onSessionExpired).not.toHaveBeenCalled();
      var error = { errorCode: 'unknown', accessToken: true };
      emitter.emit('error', error);
      expect(onSessionExpired).not.toHaveBeenCalled();
    });
  });

  describe('options', function() {

    describe('PKCE', function() {

      it('is false by default', function() {
        expect(auth.options.pkce).toBe(false);
      });

      it('can be set by arg', function() {
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
        auth = new OktaAuth({ pkce: true, url: 'http://my-okta-domain' });
        expect(auth.options.pkce).toBe(true);
      });

      it('accepts alias "grantType"', function() {
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
        auth = new OktaAuth({ grantType: "authorization_code", url: 'http://my-okta-domain' });
        expect(auth.options.pkce).toBe(true);
      });

      it('throws if PKCE is not supported', function() {
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(false);
        function fn() {
          auth = new OktaAuth({ pkce: true, url: 'http://my-okta-domain' });
        }
        expect(fn).toThrowError(
          'PKCE requires a modern browser with encryption support running in a secure context.\n' +
          'The current page is not being served with HTTPS protocol. Try using HTTPS.\n' +
          '"TextEncoder" is not defined. You may need a polyfill/shim for this browser.'
        );
      });
    })
  });

  describe('signOut', function() {
    beforeEach(function() {
      global.window.location.assign = jest.fn();
    });
    it('Default options: clear TokenManager, close session, no redirect', function() {
      spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
      spyOn(auth.tokenManager, 'clear');
      return auth.signOut()
        .then(function() {
          expect(auth.tokenManager.clear).toHaveBeenCalled();
          expect(auth.session.close).toHaveBeenCalled();
          expect(window.location.assign).not.toHaveBeenCalled();
        });
    });
    describe('revokeAccessToken', function() {
      it('will call token.revoke', function() {
        spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
        spyOn(auth.tokenManager, 'clear');
        var accessToken = { accessToken: 'fake' };
        spyOn(auth.tokenManager, 'get').and.returnValue(Promise.resolve(accessToken));
        spyOn(auth.token, 'revoke').and.returnValue(Promise.resolve());
        return auth.signOut({ revokeAccessToken: true })
          .then(function() {
            expect(auth.token.revoke).toHaveBeenCalledWith(accessToken);
            expect(auth.tokenManager.clear).toHaveBeenCalled();
            expect(auth.session.close).toHaveBeenCalled();
          });
      });
      it('will throw if token.revoke rejects with unknown error', function() {
        spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
        spyOn(auth.tokenManager, 'clear');
        var accessToken = { accessToken: 'fake' };
        spyOn(auth.tokenManager, 'get').and.returnValue(Promise.resolve(accessToken));
        var testError = new Error('test error');
        spyOn(auth.token, 'revoke').and.callFake(function() {
          return Promise.reject(testError);
        });
        return auth.signOut({ revokeAccessToken: true })
          .catch(function(e) {
            expect(e).toBe(testError);
          });
      });
      it('will not throw if token.revoke rejects with AuthApiError', function() {
        spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
        spyOn(auth.tokenManager, 'clear');
        var accessToken = { accessToken: 'fake' };
        spyOn(auth.tokenManager, 'get').and.returnValue(Promise.resolve(accessToken));
        var testError = new AuthApiError({});
        spyOn(auth.token, 'revoke').and.callFake(function() {
          return Promise.reject(testError);
        });
        return auth.signOut({ revokeAccessToken: true })
        .then(function() {
          expect(auth.token.revoke).toHaveBeenCalledWith(accessToken);
          expect(auth.tokenManager.clear).toHaveBeenCalled();
          expect(auth.session.close).toHaveBeenCalled();
        });
      });
      it('by default, will read access token from TokenManager using key "token"', function() {
        spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
        spyOn(auth.tokenManager, 'clear');
        var accessToken = { accessToken: 'fake' };
        spyOn(auth.tokenManager, 'get').and.returnValue(Promise.resolve(accessToken));
        spyOn(auth.token, 'revoke').and.returnValue(Promise.resolve());
        return auth.signOut({ revokeAccessToken: true })
          .then(function() {
            expect(auth.tokenManager.get).toHaveBeenCalledWith('token');
            expect(auth.token.revoke).toHaveBeenCalledWith(accessToken);
            expect(auth.tokenManager.clear).toHaveBeenCalled();
            expect(auth.session.close).toHaveBeenCalled();
          });
      });
      it('can pass an access token object', function() {
        spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
        spyOn(auth.tokenManager, 'clear');
        var accessToken = { accessToken: 'fake' };
        spyOn(auth.token, 'revoke').and.returnValue(Promise.resolve());
        spyOn(auth.tokenManager, 'get');
        return auth.signOut({ revokeAccessToken: true, accessToken: accessToken })
          .then(function() {
            expect(auth.tokenManager.get).not.toHaveBeenCalled();
            expect(auth.token.revoke).toHaveBeenCalledWith(accessToken);
            expect(auth.tokenManager.clear).toHaveBeenCalled();
            expect(auth.session.close).toHaveBeenCalled();
          });
      });
      it('if accessToken=false, will not revoke or read from TokenManager', function() {
        spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
        spyOn(auth.tokenManager, 'clear');
        spyOn(auth.token, 'revoke').and.returnValue(Promise.resolve());
        spyOn(auth.tokenManager, 'get');
        return auth.signOut({ revokeAccessToken: true, accessToken: false })
          .then(function() {
            expect(auth.tokenManager.get).not.toHaveBeenCalled();
            expect(auth.token.revoke).not.toHaveBeenCalled();
            expect(auth.tokenManager.clear).toHaveBeenCalled();
            expect(auth.session.close).toHaveBeenCalled();
          });
      });
      it('if accessToken cannot be located, will not attempt revoke', function() {
        spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
        spyOn(auth.tokenManager, 'clear');
        spyOn(auth.token, 'revoke').and.returnValue(Promise.resolve());
        spyOn(auth.tokenManager, 'get').and.returnValue(Promise.resolve())
        return auth.signOut({ revokeAccessToken: true })
          .then(function() {
            expect(auth.tokenManager.get).toHaveBeenCalled();
            expect(auth.token.revoke).not.toHaveBeenCalled();
            expect(auth.tokenManager.clear).toHaveBeenCalled();
            expect(auth.session.close).toHaveBeenCalled();
          });
      });
      it('can be combined with "postLogoutRedirectUri"', function() {
        spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
        spyOn(auth.tokenManager, 'clear');
        var accessToken = { accessToken: 'fake' };
        var idToken = { idToken: 'fake' };

        spyOn(auth.tokenManager, 'get');
        spyOn(auth.token, 'revoke').and.returnValue(Promise.resolve());
        return auth.signOut({ revokeAccessToken: true, accessToken: accessToken, postLogoutRedirectUri: 'http://someother', idToken: idToken })
          .then(function() {
            expect(auth.tokenManager.get).not.toHaveBeenCalled();
            expect(auth.token.revoke).toHaveBeenCalledWith(accessToken);
            expect(auth.tokenManager.clear).toHaveBeenCalled();
            expect(auth.session.close).not.toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith('http://my-okta-domain/oauth2/v1/logout?id_token_hint=fake&post_logout_redirect_uri=http%3A%2F%2Fsomeother');
          });
      });

      it('can be combined with "postLogoutRedirectUri" (no id token)', function() {
        spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
        spyOn(auth.tokenManager, 'clear');
        var accessToken = { accessToken: 'fake' };
        var idToken = false;

        spyOn(auth.tokenManager, 'get');
        spyOn(auth.token, 'revoke').and.returnValue(Promise.resolve());
        return auth.signOut({ revokeAccessToken: true, accessToken: accessToken, postLogoutRedirectUri: 'http://someother', idToken: idToken })
          .then(function() {
            expect(auth.tokenManager.get).not.toHaveBeenCalled();
            expect(auth.token.revoke).toHaveBeenCalledWith(accessToken);
            expect(auth.tokenManager.clear).toHaveBeenCalled();
            expect(auth.session.close).toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith('http://someother');
          });
      });
    });
    describe('closeSession', function() {
      it('will throw unknown errors', function() {
        var testError = new Error('test error');
        spyOn(auth.session, 'close').and.callFake(function() {
          return Promise.reject(testError);
        });
        return auth.signOut()
        .catch(function(e) {
          expect(e).toBe(testError);
        });
      });
      it('catches and absorbs "AuthApiError" errors', function() {
        var testError = new AuthApiError({});
        spyOn(auth.session, 'close').and.callFake(function() {
          return Promise.reject(testError);
        });
        return auth.signOut()
        .then(function() {
          expect(auth.session.close).toHaveBeenCalled();
        });
      });
    })
    describe('postLogoutRedirectUri', function() {
      it('can be set by config', function() {
        auth = new OktaAuth({
          url: 'http://my-okta-domain',
          postLogoutRedirectUri: 'http://someother' 
        });
        spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
        return auth.signOut()
          .then(function() {
            expect(window.location.assign).toHaveBeenCalledWith('http://someother');
          });
      });
    
      it('supports custom authorization server', function() {
        auth = new OktaAuth({
          url: 'http://my-okta-domain',
          issuer: 'http://my-okta-domain/oauth2/custom-as',
        });
        var idToken = { idToken: 'fake' };
        spyOn(auth.tokenManager, 'get').and.returnValue(Promise.resolve(idToken));
        return auth.signOut({ postLogoutRedirectUri: 'http://someother' })
          .then(function() {
            expect(window.location.assign).toHaveBeenCalledWith('http://my-okta-domain/oauth2/custom-as/v1/logout?id_token_hint=fake&post_logout_redirect_uri=http%3A%2F%2Fsomeother');
          });
      });
  
      it('will catch exceptions from session.close and perform redirect', function() {
        auth = new OktaAuth({
          url: 'http://my-okta-domain',
          postLogoutRedirectUri: 'http://someother' 
        });
        var testError = new Error('test error');
        spyOn(auth.session, 'close').and.callFake(function() {
          return Promise.reject(testError);
        });
        spyOn(auth.tokenManager, 'get').and.returnValue(Promise.resolve(null));
        return auth.signOut()
          .then(function() {
            expect(auth.session.close).toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith('http://someother');
          });
      });

      it('by default, will try to get idToken from TokenManager', function() {
        var idToken = { idToken: 'fake' };
  
        spyOn(auth.tokenManager, 'clear').and.callFake(function() {
          // Catch condition where clear() is called before the idToken is read
          idToken = false;
        });
  
        spyOn(auth.tokenManager, 'get').and.callFake(function() {
          return idToken;
        })
        spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
        return auth.signOut({ postLogoutRedirectUri: 'http://someother' })
          .then(function() {
            expect(auth.tokenManager.get).toHaveBeenCalledWith('idToken');
            expect(auth.session.close).not.toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith('http://my-okta-domain/oauth2/v1/logout?id_token_hint=fake&post_logout_redirect_uri=http%3A%2F%2Fsomeother');
          });
      });
  
      it('if idToken is passed, will skip token manager read and do location redirect', function() {
        var idToken = { idToken: 'fake' };
        var customToken = { idToken: 'fake-custom' };
        spyOn(auth.tokenManager, 'get').and.returnValue(Promise.resolve(idToken));
        return auth.signOut({ idToken: customToken, postLogoutRedirectUri: 'http://someother' })
          .then(function() {
            expect(auth.tokenManager.get).not.toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith('http://my-okta-domain/oauth2/v1/logout?id_token_hint=fake-custom&post_logout_redirect_uri=http%3A%2F%2Fsomeother');
          });
      });
  
      it('if idToken=false will skip token manager read and use session.close before redirecting', function() {
        var idToken = { idToken: 'fake' };
        spyOn(auth.tokenManager, 'get').and.returnValue(Promise.resolve(idToken));
        spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
        return auth.signOut({ idToken: false, postLogoutRedirectUri: 'http://someother' })
          .then(function() {
            expect(auth.tokenManager.get).not.toHaveBeenCalled();
            expect(auth.session.close).toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith('http://someother');
          });
      });
  
  
      it('redirect: (no idToken) - will close session and redirect to uri', function() {
        spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
        spyOn(auth.tokenManager, 'get').and.returnValue(Promise.resolve());
        spyOn(auth.tokenManager, 'clear');
        return auth.signOut({ postLogoutRedirectUri: 'http://someother' })
          .then(function() {
            expect(auth.tokenManager.clear).toHaveBeenCalled();
            expect(auth.session.close).toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith('http://someother');
          });
      });
  
      it('idToken: without a redirect option, it will not use logout redirect', function() {
        spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
        spyOn(auth.tokenManager, 'clear');
        return auth.signOut({ idToken: { idToken: 'fake' } })
          .then(function() {
            expect(auth.tokenManager.clear).toHaveBeenCalled();
            expect(auth.session.close).toHaveBeenCalled();
            expect(window.location.assign).not.toHaveBeenCalled();
          });
      });
  
      it('idToken + postLogoutRedirectUri: will use logout redirect with "post_logout_redirect_uri"', function() {
        spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
        spyOn(auth.tokenManager, 'clear');
        return auth.signOut({ idToken: { idToken: 'fake' }, postLogoutRedirectUri: 'http://someother' })
          .then(function() {
            expect(auth.tokenManager.clear).toHaveBeenCalled();
            expect(auth.session.close).not.toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith('http://my-okta-domain/oauth2/v1/logout?id_token_hint=fake&post_logout_redirect_uri=http%3A%2F%2Fsomeother');
          });
      });
  
      it('idToken + postLogoutRedirectUri + state: logout redirect url includes "state" and "post_logout_redirect_uri"', function() {
        spyOn(auth.session, 'close').and.returnValue(Promise.resolve());
        spyOn(auth.tokenManager, 'clear');
        return auth.signOut({ idToken: { idToken: 'fake' }, postLogoutRedirectUri: 'http://someother', state: 'foo=bar&yo=me' })
          .then(function() {
            expect(auth.tokenManager.clear).toHaveBeenCalled();
            expect(auth.session.close).not.toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith('http://my-okta-domain/oauth2/v1/logout?id_token_hint=fake&post_logout_redirect_uri=http%3A%2F%2Fsomeother&state=foo%3Dbar%26yo%3Dme');
          });
      });
    });

    describe('XHR logout', function() {
      it('will not catch exceptions from session.close', function() {
        auth = new OktaAuth({
          url: 'http://my-okta-domain',
        });
        var testError = new Error('test error');
        spyOn(auth.session, 'close').and.callFake(function() {
          return Promise.reject(testError);
        });
        spyOn(auth.tokenManager, 'get').and.returnValue(Promise.resolve(null));
        return auth.signOut()
          .catch(function(e) {
            expect(e).toBe(testError);
          })
          .then(function() {
            expect(auth.session.close).toHaveBeenCalled();
          });
      });
    });
  });

});