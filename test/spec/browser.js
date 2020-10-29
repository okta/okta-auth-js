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
      href: 'https://somesite.local',
      replace: jest.fn()
    };

    issuer =  'http://my-okta-domain';
    auth = new OktaAuth({ issuer, pkce: false });
  });

  it('is a valid constructor', function() {
    expect(auth instanceof OktaAuth).toBe(true);
  });

  describe('options', function() {
    describe('cookies', () => {

      it('"secure" is true by default on HTTPS', () => {
        expect(auth.options.cookies.secure).toBe(true);
      });

      it('"sameSite" is "none" by default', () => {
        expect(auth.options.cookies.sameSite).toBe('none');
      });

      it('"secure" can be set to false on HTTPS', () => {
        auth = new OktaAuth({ issuer, pkce: false, cookies: { secure: false } });
        expect(auth.options.cookies.secure).toBe(false);
        expect(auth.options.cookies.sameSite).toBe('lax');
      });

      it('"sameSite" is "lax" if secure is false', () => {
        auth = new OktaAuth({ issuer, pkce: false, cookies: { secure: false }});
        expect(auth.options.cookies.sameSite).toBe('lax');
      });

      it('"secure" is false by default on HTTP', () => {
        window.location.protocol = 'http:';
        window.location.hostname = 'my-site';
        auth = new OktaAuth({ issuer, pkce: false });
        expect(auth.options.cookies.secure).toBe(false);
        expect(auth.options.cookies.sameSite).toBe('lax');
      });

      it('"secure" is forced to false if running on HTTP', () => {
        window.location.protocol = 'http:';
        window.location.hostname = 'my-site';
        auth = new OktaAuth({ issuer, pkce: false, cookies: { secure: true }});
        expect(auth.options.cookies.secure).toBe(false);
        expect(auth.options.cookies.sameSite).toBe('lax');
      });

      it('"sameSite" is forced to "lax" if running on HTTP', () => {
        window.location.protocol = 'http:';
        window.location.hostname = 'my-site';
        auth = new OktaAuth({ issuer, pkce: false, cookies: { sameSite: 'none' }});
        expect(auth.options.cookies.secure).toBe(false);
        expect(auth.options.cookies.sameSite).toBe('lax');
      });

      it('console warning if secure is forced to false running on HTTP', () => {
        window.location.protocol = 'http:';
        window.location.hostname = 'my-site';
        jest.spyOn(console, 'warn').mockReturnValue(null);
        auth = new OktaAuth({ issuer: 'http://my-okta-domain' , cookies: { secure: true }});
        
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

  describe('signInWithCredentials', () => {
    let options;
    beforeEach(() => {
      options = { username: 'fake', password: 'fake' };
      auth.fingerprint = jest.fn().mockResolvedValue('fake fingerprint');
    });
    it('should call "/api/v1/authn" endpoint with default options', async () => {
      await auth.signInWithCredentials(options);
      expect(postToTransaction).toHaveBeenCalledWith(auth, '/api/v1/authn', options, undefined);
    });
    it('should call fingerprint if has sendFingerprint in options', async () => {
      options.sendFingerprint = true;
      await auth.signInWithCredentials(options);
      delete options.sendFingerprint;
      expect(auth.fingerprint).toHaveBeenCalled();
      expect(postToTransaction).toHaveBeenCalledWith(auth, '/api/v1/authn', options, {
        headers: { 'X-Device-Fingerprint': 'fake fingerprint' }
      });
    });
  });

  describe('signIn', () => {
    let options;
    beforeEach(() => {
      options = { username: 'fake', password: 'fake' };
      auth.signInWithCredentials = jest.fn();
    });
    it('should console warning for deprecation if is localhost', async () => {
      global.window.location = {
        protocol: 'http:',
        hostname: 'localhost',
        href: 'http://localhost'
      };
      jest.spyOn(console, 'warn').mockReturnValue(null);
      await auth.signIn(options);
      expect(console.warn).toHaveBeenCalledWith('[okta-auth-sdk] DEPRECATION: This method has been deprecated, please use signInWithCredentials() instead.');
    });
    it('should not console warning for deprecation if is not localhost', async () => {
      jest.spyOn(console, 'warn').mockReturnValue(null);
      await auth.signIn(options);
      expect(console.warn).not.toHaveBeenCalled();
    });
    it('should call signIn() with provided options', async () => {
      await auth.signIn(options);
      expect(auth.signInWithCredentials).toHaveBeenCalledWith(options);
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

    it('should add originalUri to sessionStorage if provided in options', async () => {
      const originalUri = 'notrandom';
      await auth.signInWithRedirect({ originalUri });
      expect(setItemMock).toHaveBeenCalledWith(REFERRER_PATH_STORAGE_KEY, originalUri);
    });

    it('should not add originalUri to sessionStorage if no originalUri in options', async () => {
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
      const params = { originalUri: 'https://foo.random', ...additionalParams };
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

  describe('isAuthenticated', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return from authState if not in isPending state', async () => {
      let retVal;
      // expect true
      auth.authStateManager.getAuthState = jest.fn().mockReturnValue({
        isAuthenticated: true,
        isPending: false
      });
      retVal = await auth.isAuthenticated();
      expect(retVal).toBe(true);
      // expect false
      auth.authStateManager.getAuthState = jest.fn().mockReturnValue({
        isAuthenticated: false,
        isPending: false
      });
      retVal = await auth.isAuthenticated();
      expect(retVal).toBe(false);
    });

    it('should return based on next emitted non-pending authState', async () => {
      let retVal;
      auth.authStateManager.getAuthState = jest.fn().mockReturnValue({
        isAuthenticated: false,
        isPending: true
      });
      auth.tokenManager.getTokens = jest.fn().mockResolvedValue({
        accessToken: 'fake access token',
        idToken: 'fake id token'
      });
      retVal = await auth.isAuthenticated();
      expect(retVal).toBe(true);
      expect(auth.emitter.e.authStateChange).toBe(undefined);
    });

    it('should timeout and return false no non-pending state is emitted', async () => {
      expect.assertions(2);
      auth.authStateManager.getAuthState = jest.fn().mockReturnValue({
        isAuthenticated: false,
        isPending: true
      });
      auth.authStateManager.updateAuthState = jest.fn();
      return new Promise(resolve => {
        auth.isAuthenticated().then(isAuthenticated => {
          expect(isAuthenticated).toBe(false);
          expect(auth.emitter.e.authStateChange).toBe(undefined);
          resolve();
        });
        jest.runAllTimers();
      });
    });
  });

  describe('getUser', () => {
    it('should call token.getUserInfo with tokens from authState', () => {
      auth.token = {
        getUserInfo: jest.fn().mockResolvedValue(undefined)
      };
      auth.authStateManager.getAuthState = jest.fn().mockReturnValue({
        idToken: tokens.standardIdTokenParsed,
        accessToken: tokens.standardAccessTokenParsed
      });
      auth.getUser();
      expect(auth.token.getUserInfo).toHaveBeenCalledWith(tokens.standardAccessTokenParsed, tokens.standardIdTokenParsed);
    });
  });

  describe('getIdToken', () => {
    it('retrieves token from authStateManager', () => {
      auth.authStateManager.getAuthState = jest.fn().mockReturnValue({
        idToken: tokens.standardIdTokenParsed
      });
      const retVal = auth.getIdToken();
      expect(retVal).toBe(tokens.standardIdToken);
    });

    it('should return undefined if no idToken in authState', () => {
      auth.authStateManager.getAuthState = jest.fn().mockReturnValue({});
      const retVal = auth.getIdToken();
      expect(retVal).toBe(undefined);
    });
  });

  describe('getAccessToken', () => {
    it('retrieves token from authStateManager', () => {
      auth.authStateManager.getAuthState = jest.fn().mockReturnValue({
        accessToken: tokens.standardAccessTokenParsed
      });
      const retVal = auth.getAccessToken();
      expect(retVal).toBe(tokens.standardAccessToken);
    });

    it('should return undefined if no accessToken in authState', async () => {
      auth.authStateManager.getAuthState = jest.fn().mockReturnValue({});
      const retVal = auth.getAccessToken();
      expect(retVal).toBe(undefined);
    });
  });

  describe('storeTokensFromRedirect', () => {
    beforeEach(() => {
      auth.token.parseFromUrl = jest.fn().mockResolvedValue({ 
        tokens: { idToken: 'fakeIdToken', accessToken: 'fakeAccessToken' }
      });
      auth.tokenManager.setTokens = jest.fn();
    });
    it('calls parseFromUrl', async () => {
      await auth.storeTokensFromRedirect();
      expect(auth.token.parseFromUrl).toHaveBeenCalled();
    });
    it('stores tokens', async () => {
      const accessToken = { accessToken: 'foo' };
      const idToken = { idToken: 'bar' };
      auth.token.parseFromUrl = jest.fn().mockResolvedValue({ 
        tokens: { accessToken, idToken }
      });
      await auth.storeTokensFromRedirect();
      expect(auth.tokenManager.setTokens).toHaveBeenCalledWith({ accessToken, idToken });
    });
  });

  describe('setOriginalUri', () => {
    let setItemMock;
    beforeEach(() => {
      setItemMock = jest.fn();
      storageUtil.getSessionStorage = jest.fn().mockImplementation(() => ({
        setItem: setItemMock
      }));
    });
    it('should save the "referrerPath" in sessionStorage', () => {
      const uri = 'https://foo.random';
      auth.setOriginalUri(uri);
      expect(setItemMock).toHaveBeenCalledWith(REFERRER_PATH_STORAGE_KEY, uri);
    });
    it('should save the window.location.href by default', () => {
      auth.setOriginalUri();
      expect(setItemMock).toHaveBeenCalledWith(REFERRER_PATH_STORAGE_KEY, window.location.href);
    });
  });

  describe('getOriginalUri', () => {
    let removeItemMock;
    let getItemMock;
    beforeEach(() => {
      removeItemMock = jest.fn();
      getItemMock = jest.fn().mockReturnValue('fakeOriginalUri');
      storageUtil.getSessionStorage = jest.fn().mockImplementation(() => ({
        getItem: getItemMock,
        removeItem: removeItemMock
      }));
    });
    it('should get and cleare referrer from storage', () => {
      const res = auth.getOriginalUri();
      expect(res).toBe('fakeOriginalUri');
    });
    it('returns window.location.origin if nothing was set', () => {
      getItemMock = jest.fn().mockReturnValue(null);
      const res = auth.getOriginalUri();
      expect(res).toBe(window.location.origin);
    });
  });

  describe('removeOriginalUri', () => {
    let removeItemMock;
    beforeEach(() => {
      removeItemMock = jest.fn();
      storageUtil.getSessionStorage = jest.fn().mockImplementation(() => ({
        removeItem: removeItemMock
      }));
    });
    it('should cleare referrer from localStorage', () => {
      auth.removeOriginalUri();
      expect(removeItemMock).toHaveBeenCalledWith(REFERRER_PATH_STORAGE_KEY);
    });
  });

  describe('handleLoginRedirect', () => {
    beforeEach(() => {
      jest.spyOn(auth.authStateManager, 'unsubscribe');
      jest.spyOn(auth, 'getOriginalUri').mockReturnValue('/fakeuri');
      jest.spyOn(auth, 'removeOriginalUri');
    });

    it('should redirect to originalUri when tokens are provided', async () => {
      await auth.handleLoginRedirect({
        accessToken: tokens.standardAccessTokenParsed,
        idToken: tokens.standardIdTokenParsed
      });
      return new Promise(resolve => {
        // wait for the next emitted authState
        setTimeout(() => {
          expect(auth.authStateManager.unsubscribe).toHaveBeenCalled();
          expect(auth.getOriginalUri).toHaveBeenCalled();
          expect(auth.removeOriginalUri).toHaveBeenCalled();
          expect(window.location.replace).toHaveBeenCalledWith('/fakeuri');
          resolve();    
        }, 100);
      });
    });

    it('should get tokens from the callback url when under login redirect flow', async () => {
      auth.token.parseFromUrl = jest.fn().mockResolvedValue({
        tokens: {
          accessToken: tokens.standardAccessTokenParsed,
          idToken: tokens.standardIdTokenParsed
        }
      });
      auth.isLoginRedirect = jest.fn().mockReturnValue(true);
      await auth.handleLoginRedirect();
      return new Promise(resolve => {
        // wait for the next emitted authState
        setTimeout(() => {
          expect(auth.authStateManager.unsubscribe).toHaveBeenCalled();
          expect(auth.getOriginalUri).toHaveBeenCalled();
          expect(auth.removeOriginalUri).toHaveBeenCalled();
          expect(window.location.replace).toHaveBeenCalledWith('/fakeuri');
          resolve();    
        }, 100);
      });
    });

    it('should use options.restoreOriginalUri if provided', async () => {
      auth.options.restoreOriginalUri = jest.fn();
      auth.token.parseFromUrl = jest.fn().mockResolvedValue({
        tokens: {
          accessToken: tokens.standardAccessTokenParsed,
          idToken: tokens.standardIdTokenParsed
        }
      });
      auth.isLoginRedirect = jest.fn().mockReturnValue(true);
      await auth.handleLoginRedirect();
      return new Promise(resolve => {
        // wait for the next emitted authState
        setTimeout(() => {
          expect(auth.authStateManager.unsubscribe).toHaveBeenCalled();
          expect(auth.getOriginalUri).toHaveBeenCalled();
          expect(auth.removeOriginalUri).toHaveBeenCalled();
          expect(auth.options.restoreOriginalUri).toHaveBeenCalledWith(auth, '/fakeuri');
          expect(window.location.replace).not.toHaveBeenCalled();
          resolve();    
        }, 100);
      });
    });

    it('should unsubscribe authState listener if neither tokens are provided, nor under login redirect flow', async () => {
      auth.isLoginRedirect = jest.fn().mockReturnValue(false);
      await auth.handleLoginRedirect();
      return new Promise(resolve => {
        // wait for the next emitted authState
        setTimeout(() => {
          expect(auth.authStateManager.unsubscribe).toHaveBeenCalled();
          expect(auth.getOriginalUri).not.toHaveBeenCalled();
          expect(auth.removeOriginalUri).not.toHaveBeenCalled();
          expect(window.location.replace).not.toHaveBeenCalled();
          resolve();    
        }, 100);
      });
    });
  });
});
