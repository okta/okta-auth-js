/* eslint-disable no-new */
/* global window */
jest.mock('cross-fetch');
jest.mock('../../lib/tx');

import { 
  OktaAuth, 
  AuthApiError, 
  REFERRER_PATH_STORAGE_KEY 
} from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import {postToTransaction} from '../../lib/tx';
import storageUtil from '../../lib/browser/browserStorage';

describe('Browser', function() {
  let auth;
  let issuer;
  let originalLocation;

  afterEach(() => {
    global.window.location = originalLocation;
  });

  beforeEach(function() {
    originalLocation = global.window.location;
    delete global.window.location;
    global.window.location = {
      protocol: 'https:',
      hostname: 'somesite.local',
      href: 'https://somesite.local'
    };

    issuer =  'http://my-okta-domain';
    auth = new OktaAuth({ issuer, pkce: false });
  });

  it('is a valid constructor', function() {
    expect(auth instanceof OktaAuth).toBe(true);
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
          '[okta-auth-sdk] WARN: The current page is not being served with the HTTPS protocol.\n' +
          'For security reasons, we strongly recommend using HTTPS.\n' +
          'If you cannot use HTTPS, set "cookies.secure" option to false.'
        );
      });

      it('does not throw if running on HTTP and cookies.secure = false', () => {
        global.window.location.protocol = 'http:';
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
    });
  });

  describe('signIn', () => {
    let options;
    beforeEach(() => {
      options = { username: 'fake', password: 'fake' };
      auth.fingerprint = jest.fn().mockResolvedValue('fake fingerprint');
    });
    it('should console warning for deprecation', async () => {
      jest.spyOn(console, 'warn').mockReturnValue(null);
      await auth.signIn(options);
      expect(console.warn).toHaveBeenCalledWith('[okta-auth-sdk] DEPRECATION: This method will be deprecated in v5.0, please use signInWithCredentials() instead.');
    });
    it('should call "/api/v1/authn" endpoint with default options', async () => {
      await auth.signIn(options);
      expect(postToTransaction).toHaveBeenCalledWith(auth, '/api/v1/authn', options, undefined);
    });
    it('should call fingerprint if has sendFingerprint in options', async () => {
      options.sendFingerprint = true;
      await auth.signIn(options);
      delete options.sendFingerprint;
      expect(auth.fingerprint).toHaveBeenCalled();
      expect(postToTransaction).toHaveBeenCalledWith(auth, '/api/v1/authn', options, {
        headers: { 'X-Device-Fingerprint': 'fake fingerprint' }
      });
    });
  });

  describe('signInWithCredentials', () => {
    let options;
    beforeEach(() => {
      options = { username: 'fake', password: 'fake' };
      auth.signIn = jest.fn();
    });
    it('should call signIn() with provided options', async () => {
      await auth.signInWithCredentials(options);
      expect(auth.signIn).toHaveBeenCalledWith(options);
    });
  });

  describe('signInWithRedirect', () => {
    let setItemMock;
    beforeEach(() => {
      auth.token.getWithRedirect = jest.fn().mockResolvedValue('fake');
      setItemMock = jest.fn();
      storageUtil.getSessionStorage = jest.fn().mockImplementation(() => ({
        setItem: setItemMock
      }));
    });

    it('should add fromUri to sessionStorage if provided in options', async () => {
      const fromUri = 'notrandom';
      await auth.signInWithRedirect({ fromUri });
      expect(setItemMock).toHaveBeenCalledWith(REFERRER_PATH_STORAGE_KEY, fromUri);
    });

    it('should not add fromUri to sessionStorage if no fromUri in options', async () => {
      await auth.signInWithRedirect();
      expect(setItemMock).not.toHaveBeenCalled();
    });

    it('should use default scopes and responseType if none is provided', async () => {
      await auth.signInWithRedirect({ foo: 'bar' });
      expect(auth.token.getWithRedirect).toHaveBeenCalledWith({
        foo: 'bar',
        scopes: ['openid', 'email', 'profile'],
        responseType: ['id_token', 'token']
      });
    });

    it('should use provided scopes and responseType', async () => {
      const params = { scopes: ['openid'], responseType: ['token'] };
      await auth.signInWithRedirect(params);
      expect(auth.token.getWithRedirect).toHaveBeenCalledWith(params);
    });

    it('should passes "additionalParams" to token.getWithRedirect()', () => {
      const additionalParams = { foo: 'bar', baz: 'biz', scopes: ['fake'], responseType: ['fake'] };
      const params = { fromUri: 'https://foo.random', ...additionalParams };
      auth.signInWithRedirect(params);
      expect(auth.token.getWithRedirect).toHaveBeenCalledWith(additionalParams);
    });

    it('should not trigger second call if signIn flow is in progress', () => {
      expect.assertions(1);
      return Promise.all([auth.signInWithRedirect(), auth.signInWithRedirect()]).then(() => {
        expect(auth.token.getWithRedirect).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('revokeAccessToken', function() {
    it('will read from TokenManager and call token.revoke', function() {
      var accessToken = { accessToken: 'fake' };
      spyOn(auth.tokenManager, 'getTokens').and.returnValue(Promise.resolve({ accessToken }));
      spyOn(auth.tokenManager, 'remove').and.returnValue(Promise.resolve(accessToken));
      spyOn(auth.token, 'revoke').and.returnValue(Promise.resolve());
      return auth.revokeAccessToken()
        .then(function() {
          expect(auth.tokenManager.getTokens).toHaveBeenCalled();
          expect(auth.tokenManager.remove).toHaveBeenCalled();
          expect(auth.token.revoke).toHaveBeenCalledWith(accessToken);
        });
    });
    it('will throw if token.revoke rejects with unknown error', function() {
      var accessToken = { accessToken: 'fake' };
      spyOn(auth.tokenManager, 'getTokens').and.returnValue(Promise.resolve({ accessToken }));
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
      spyOn(auth.tokenManager, 'getTokens').and.returnValue(Promise.resolve({}));
      return auth.revokeAccessToken()
        .then(() => {
          expect(auth.tokenManager.getTokens).toHaveBeenCalled();
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
    let href;
    let encodedOrigin;
  
    beforeEach(function() {
      origin = 'https://somesite.local';
      href = `${origin}/some-route`;
      encodedOrigin = encodeURIComponent(origin);
      Object.assign(global.window.location, {
        origin,
        href,
        assign: jest.fn(),
        reload: jest.fn()
      });
    });

    describe('with idToken and accessToken', () => {
      let idToken;
      let accessToken;

      function initSpies() {
        auth.tokenManager.getTokens = jest.fn().mockResolvedValue({ accessToken, idToken });
        spyOn(auth.tokenManager, 'clear');
        spyOn(auth, 'revokeAccessToken').and.returnValue(Promise.resolve());
        spyOn(auth, 'closeSession').and.returnValue(Promise.resolve());
      }

      beforeEach(() => {
        accessToken = { accessToken: 'fake' };
        idToken = { idToken: 'fake' };
        initSpies();
      });

      it('Default options: will revokeAccessToken and use window.location.origin for postLogoutRedirectUri', function() {
        return auth.signOut()
          .then(function() {
            expect(auth.tokenManager.getTokens).toHaveBeenCalledTimes(2);
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
            expect(auth.tokenManager.getTokens).toHaveBeenCalledTimes(1);
            expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${customToken.idToken}&post_logout_redirect_uri=${encodedOrigin}`);
          });
      });
  
      it('if idToken=false will skip token manager read and call closeSession', function() {
        return auth.signOut({ idToken: false })
          .then(function() {
            expect(auth.tokenManager.getTokens).toHaveBeenCalledTimes(1);
            expect(auth.closeSession).toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith(window.location.origin);
          });
      });
  
      it('if idToken=false and origin===href will reload the page', function() {
        global.window.location.href = origin;
        return auth.signOut({ idToken: false })
          .then(function() {
            expect(auth.tokenManager.getTokens).toHaveBeenCalledTimes(1);
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
            expect(auth.tokenManager.getTokens).toHaveBeenCalledTimes(1);
            expect(auth.revokeAccessToken).not.toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${idToken.idToken}&post_logout_redirect_uri=${encodedOrigin}`);
          });
      });

      it('Can pass a "accessToken=false" to skip accessToken logic', function() {
        return auth.signOut({ accessToken: false })
          .then(function() {
            expect(auth.tokenManager.getTokens).toHaveBeenCalledTimes(1);
            expect(auth.revokeAccessToken).not.toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${idToken.idToken}&post_logout_redirect_uri=${encodedOrigin}`);
          });
      });
    });

    describe('without idToken', () => {
      let accessToken;

      beforeEach(() => {
        accessToken = { accessToken: 'fake' };
        auth.tokenManager.getTokens = jest.fn().mockResolvedValue({ accessToken });
        spyOn(auth.tokenManager, 'clear');
        spyOn(auth, 'revokeAccessToken').and.returnValue(Promise.resolve());
      });

      it('Default options: will revokeAccessToken and fallback to closeSession and redirect to window.location.origin', function() {
        spyOn(auth, 'closeSession').and.returnValue(Promise.resolve());
        return auth.signOut()
          .then(function() {
            expect(auth.tokenManager.getTokens).toHaveBeenCalledTimes(2);
            expect(auth.revokeAccessToken).toHaveBeenCalledWith(accessToken);
            expect(auth.tokenManager.clear).toHaveBeenCalled();
            expect(auth.closeSession).toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith(window.location.origin);
          });
      });

      it('Default options: if href===origin will reload the page', function() {
        spyOn(auth, 'closeSession').and.returnValue(Promise.resolve());
        global.window.location.href = origin;
        return auth.signOut()
          .then(function() {
            expect(auth.tokenManager.getTokens).toHaveBeenCalledTimes(2);
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
        auth.tokenManager.getTokens = jest.fn().mockResolvedValue({ idToken });
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

  describe('getUser', () => {
    it('should be an alias method of token.getUserInfo', () => {
      auth.token = {
        getUserInfo: jest.fn().mockResolvedValue(undefined)
      };
      auth.getUser();
      expect(auth.token.getUserInfo).toHaveBeenCalled();
    });
  });

  describe('getIdToken', () => {
    it('retrieves token from token manager', async () => {
      expect.assertions(1);
      auth.tokenManager.getTokens = jest.fn().mockResolvedValue({
        accessToken: tokens.standardAccessTokenParsed,
        idToken: tokens.standardIdTokenParsed
      });
      const retVal = await auth.getIdToken();
      expect(retVal).toBe(tokens.standardIdToken);
    });

    it('catches exceptions', async () => {
      auth.tokenManager.getTokens = jest.fn().mockImplementation(key => {
        expect(key).toBe('idToken');
        throw new Error('expected test error');
      });
      const retVal = await auth.getIdToken();
      expect(retVal).toBe(undefined);
    });
  });

  describe('getAccessToken', () => {
    it('retrieves token from token manager', async () => {
      expect.assertions(1);
      auth.tokenManager.getTokens = jest.fn().mockResolvedValue({
        accessToken: tokens.standardAccessTokenParsed,
        idToken: tokens.standardIdTokenParsed
      });
      const retVal = await auth.getAccessToken();
      expect(retVal).toBe(tokens.standardAccessToken);
    });

    it('catches exceptions', async () => {
      auth.tokenManager.getTokens = jest.fn().mockImplementation(key => {
        expect(key).toBe('accessToken');
        throw new Error('expected test error');
      });
      const retVal = await auth.getAccessToken();
      expect(retVal).toBe(undefined);
    });
  });

  describe('handleAuthentication', () => {
    let removeItemMock;
    beforeEach(() => {
      removeItemMock = jest.fn();
      storageUtil.getSessionStorage = jest.fn().mockImplementation(() => ({
        getItem: jest.fn().mockReturnValue('fakeFromUri'),
        removeItem: removeItemMock
      }));
      auth.token.parseFromUrl = jest.fn().mockResolvedValue({ 
        tokens: { idToken: 'fakeIdToken', accessToken: 'fakeAccessToken' }
      });
      auth.tokenManager.setTokens = jest.fn();
    });
    it('calls parseFromUrl', async () => {
      await auth.handleAuthentication();
      expect(auth.token.parseFromUrl).toHaveBeenCalled();
    });
    it('stores tokens', async () => {
      const accessToken = { accessToken: 'foo' };
      const idToken = { idToken: 'bar' };
      auth.token.parseFromUrl = jest.fn().mockResolvedValue({ 
        tokens: { accessToken, idToken }
      });
      await auth.handleAuthentication();
      expect(auth.tokenManager.setTokens).toHaveBeenCalledWith({ accessToken, idToken });
    });
    it('should clear and resolve as the stored fromUri', async () => {
      const fromUri = await auth.handleAuthentication();
      expect(fromUri).toEqual('fakeFromUri');
      expect(removeItemMock).toHaveBeenCalled();
    });
    it('should resolve as null if no fromUri has been set', async () => {
      storageUtil.getSessionStorage = jest.fn().mockImplementation(() => ({
        getItem: jest.fn().mockReturnValue(null),
        removeItem: removeItemMock
      }));
      const fromUri = await auth.handleAuthentication();
      expect(fromUri).toEqual(null);
      expect(removeItemMock).toHaveBeenCalled();
    });
  });
});
