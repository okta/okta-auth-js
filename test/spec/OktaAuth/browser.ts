/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


/* eslint-disable no-new */
/* global window */

import { 
  OktaAuth, 
  REFERRER_PATH_STORAGE_KEY 
} from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import storageUtil from '../../../lib/browser/browserStorage';

jest.mock('../../../lib/oidc/parseFromUrl', () => {
  return {
    parseOAuthResponseFromUrl: async () => { return {}; },
    parseFromUrl: async () => { return {}; },
  };
});

const mocked = {
  parseFromUrl: require('../../../lib/oidc/parseFromUrl')
};

describe('OktaAuth (browser)', function() {
  let auth;
  let issuer;
  let originalLocation;

  afterEach(() => {
    global.window.location = originalLocation;
  });

  beforeEach(function() {
    originalLocation = global.window.location;
    delete (global.window as any).location;
    global.window.location = {
      protocol: 'https:',
      hostname: 'somesite.local',
      href: 'https://somesite.local',
      replace: jest.fn()
    } as unknown as Location;

    issuer =  'http://my-okta-domain';
    auth = new OktaAuth({ issuer, pkce: false });
  });

  describe('options', function() {
    describe('storageUtil', function() {
      it('creates unique in-memory storage', () => {
        const auth1 = new OktaAuth({ issuer });
        const memStorage1 = auth1.options!.storageUtil!.getStorageByType('memory');
        memStorage1.setItem('foo', 'bar');
        expect(memStorage1.getItem('foo')).toBe('bar');
  
        const auth2 = new OktaAuth({ issuer });
        const memStorage2 = auth2.options!.storageUtil!.getStorageByType('memory');
        expect(memStorage2.getItem('foo')).toBe(undefined);
      });
    });

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
        jest.spyOn(console, 'warn').mockReturnValue();
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
  });

  describe('signInWithRedirect', () => {
    let setItemMock;
    beforeEach(() => {
      auth.token.getWithRedirect = jest.fn().mockResolvedValue('fake');
      setItemMock = jest.fn();
      jest.spyOn(storageUtil, 'getSessionStorage').mockImplementation(() => ({
        setItem: setItemMock
      } as Storage));
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

    // TODO: remove this test when default scopes are changed OKTA-343294
    it('should use default scopes if none is provided', async () => {
      await auth.signInWithRedirect({ foo: 'bar' });
      expect(auth.token.getWithRedirect).toHaveBeenCalledWith({
        foo: 'bar',
        scopes: ['openid', 'email', 'profile']
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
        auth.tokenManager.getTokensSync = jest.fn().mockReturnValue({ accessToken, idToken });
        spyOn(auth.tokenManager, 'clear');
        spyOn(auth, 'revokeAccessToken').and.returnValue(Promise.resolve());
        spyOn(auth, 'revokeRefreshToken').and.returnValue(Promise.resolve());
        spyOn(auth, 'closeSession').and.returnValue(Promise.resolve());
      }

      beforeEach(() => {
        accessToken = { accessToken: 'fake' };
        idToken = { idToken: 'fake' };
        initSpies();
      });

      it('Default options when no refreshToken: will revokeAccessToken and use window.location.origin for postLogoutRedirectUri', function() {
        return auth.signOut()
          .then(function() {
            expect(auth.revokeRefreshToken).not.toHaveBeenCalled();
            expect(auth.revokeAccessToken).toHaveBeenCalledWith(accessToken);
            expect(auth.closeSession).not.toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${idToken.idToken}&post_logout_redirect_uri=${encodedOrigin}`);
          });
      });

      it('Default options when refreshToken present: will revokeRefreshToken and use window.location.origin for postLogoutRedirectUri', function() {
        const refreshToken = { refreshToken: 'fake'};
        auth.tokenManager.getTokensSync = jest.fn().mockReturnValue({ accessToken, idToken, refreshToken });

        return auth.signOut()
          .then(function() {
            expect(auth.revokeAccessToken).toHaveBeenCalledWith(accessToken);
            expect(auth.revokeRefreshToken).toHaveBeenCalledWith(refreshToken);
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
            expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${customToken.idToken}&post_logout_redirect_uri=${encodedOrigin}`);
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

      it('Can pass a "revokeAccessToken=false" to skip revoke logic', function() {
        const refreshToken = { refreshToken: 'fake'};
        auth.tokenManager.getTokensSync = jest.fn().mockReturnValue({ accessToken, idToken, refreshToken });

        return auth.signOut({ revokeAccessToken: false })
          .then(function() {
            expect(auth.revokeAccessToken).not.toHaveBeenCalled();
            expect(auth.revokeRefreshToken).toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${idToken.idToken}&post_logout_redirect_uri=${encodedOrigin}`);
          });
      });

      it('Can pass a "revokeRefreshToken=false" to skip revoke logic', function() {
        const refreshToken = { refreshToken: 'fake'};
        auth.tokenManager.getTokensSync = jest.fn().mockReturnValue({ accessToken, idToken, refreshToken });
        
        return auth.signOut({ revokeRefreshToken: false })
          .then(function() {
            expect(auth.revokeAccessToken).toHaveBeenCalled();
            expect(auth.revokeRefreshToken).not.toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${idToken.idToken}&post_logout_redirect_uri=${encodedOrigin}`);
          });
      });

      it('Can pass a "accessToken=false" to skip accessToken logic', function() {
        return auth.signOut({ accessToken: false })
          .then(function() {
            expect(auth.revokeAccessToken).not.toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${idToken.idToken}&post_logout_redirect_uri=${encodedOrigin}`);
          });
      });

      it('skips token clear logic by default', () => {
        auth.tokenManager.addPendingRemoveFlags = jest.fn();
        return auth.signOut()
          .then(function() {
            expect(auth.tokenManager.clear).not.toHaveBeenCalled();
            expect(auth.tokenManager.addPendingRemoveFlags).toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${idToken.idToken}&post_logout_redirect_uri=${encodedOrigin}`);
          });
      });

      it('if "clearTokensBeforeRedirect" is true, then tokens will be cleared and pending remove flag will not be set', function() {
        auth.tokenManager.addPendingRemoveFlags = jest.fn();
        return auth.signOut({ clearTokensBeforeRedirect: true })
          .then(function() {
            expect(auth.tokenManager.clear).toHaveBeenCalled();
            expect(auth.tokenManager.addPendingRemoveFlags).not.toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith(`${issuer}/oauth2/v1/logout?id_token_hint=${idToken.idToken}&post_logout_redirect_uri=${encodedOrigin}`);
          });
      });
    });

    describe('without idToken', () => {
      let accessToken;

      beforeEach(() => {
        accessToken = { accessToken: 'fake' };
        auth.tokenManager.getTokensSync = jest.fn().mockReturnValue({ accessToken });
        spyOn(auth.tokenManager, 'clear');
        spyOn(auth, 'revokeAccessToken').and.returnValue(Promise.resolve());
      });

      it('Default options: will revokeAccessToken and fallback to closeSession and redirect to window.location.origin', function() {
        spyOn(auth, 'closeSession').and.returnValue(Promise.resolve());
        return auth.signOut()
          .then(function() {
            expect(auth.tokenManager.getTokensSync).toHaveBeenCalledTimes(4);
            expect(auth.revokeAccessToken).toHaveBeenCalledWith(accessToken);
            expect(auth.closeSession).toHaveBeenCalled();
            expect(window.location.assign).toHaveBeenCalledWith(window.location.origin);
          });
      });

      it('Default options: if href===origin will reload the page', function() {
        spyOn(auth, 'closeSession').and.returnValue(Promise.resolve());
        global.window.location.href = origin;
        return auth.signOut()
          .then(function() {
            expect(auth.tokenManager.getTokensSync).toHaveBeenCalledTimes(4);
            expect(auth.revokeAccessToken).toHaveBeenCalledWith(accessToken);
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
        auth.tokenManager.getTokensSync = jest.fn().mockReturnValue({ idToken });
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
      jest.spyOn(storageUtil, 'getSessionStorage').mockImplementation(() => ({
        setItem: setItemMock
      } as Storage));
    });
    it('should save the "referrerPath" in sessionStorage', () => {
      const uri = 'https://foo.random';
      auth.setOriginalUri(uri);
      expect(setItemMock).toHaveBeenCalledWith(REFERRER_PATH_STORAGE_KEY, uri);
    });
    it('does not have a default value', () => {
      auth.setOriginalUri();
      expect(setItemMock).toHaveBeenCalledWith(REFERRER_PATH_STORAGE_KEY, undefined);
    });
  });

  describe('getOriginalUri', () => {
    let mockSessionStorage;
    let mockSharedStorage;
    beforeEach(() => {
      mockSessionStorage = {
        getItem: () => {},
        removeItem: () => {}
      };
      mockSharedStorage = {
        getItem: () => {},
        removeItem: () => {}
      };
      jest.spyOn(storageUtil, 'getSessionStorage').mockImplementation(() => mockSessionStorage as Storage);
      jest.spyOn(auth.storageManager, 'getOriginalUriStorage').mockReturnValue(mockSharedStorage);
    });
    it('should get referrer from storage', () => {
      const originalUri = 'fakeOriginalUri';
      jest.spyOn(mockSessionStorage, 'getItem').mockReturnValue(originalUri);
      jest.spyOn(mockSharedStorage, 'getItem');
      const res = auth.getOriginalUri();
      expect(res).toBe(originalUri);
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('referrerPath');
      expect(mockSharedStorage.getItem).not.toHaveBeenCalled();
    });
    it('returns undefined if nothing was set', () => {
      const res = auth.getOriginalUri();
      expect(res).toBe(undefined);
    });
    describe('with state', () => {
      it('prefers value from shared storage', () => {
        jest.spyOn(mockSessionStorage, 'getItem').mockReturnValue('sessionUri');
        jest.spyOn(mockSharedStorage, 'getItem').mockReturnValue('sharedUri');
        const res = auth.getOriginalUri('mock-state');
        expect(res).toBe('sharedUri');
        expect(mockSharedStorage.getItem).toHaveBeenCalledWith('mock-state');
        expect(mockSessionStorage.getItem).not.toHaveBeenCalled();
      });
      it('returns value in session storage, if not found in shared storage', () => {
        jest.spyOn(mockSessionStorage, 'getItem').mockReturnValue('sessionUri');
        jest.spyOn(mockSharedStorage, 'getItem').mockReturnValue(undefined);
        const res = auth.getOriginalUri('mock-state');
        expect(res).toBe('sessionUri');
        expect(mockSharedStorage.getItem).toHaveBeenCalledWith('mock-state');
        expect(mockSessionStorage.getItem).toHaveBeenCalledWith('referrerPath');
      });
    });
  });

  describe('removeOriginalUri', () => {
    let removeItemMock;
    beforeEach(() => {
      removeItemMock = jest.fn();
      jest.spyOn(storageUtil, 'getSessionStorage').mockImplementation(() => ({
        removeItem: removeItemMock
      } as Storage));
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
      jest.spyOn(auth.tokenManager, 'hasExpired').mockReturnValue(false);

      const parseFromUrl = auth.token.parseFromUrl = jest.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (parseFromUrl as any)._getLocation = jest.fn().mockReturnValue({
        hash: '#mock-hash',
        search: '?mock-search'
      });
    });

    describe('tokens are passed', () => {
      it('should redirect to originalUri', async () => {
        await auth.handleLoginRedirect({
          accessToken: tokens.standardAccessTokenParsed,
          idToken: tokens.standardIdTokenParsed
        });
        expect(auth.getOriginalUri).toHaveBeenCalledWith(undefined);
        expect(auth.removeOriginalUri).toHaveBeenCalledWith(undefined);
        expect(window.location.replace).toHaveBeenCalledWith('/fakeuri');
      });

      it('originalUri can be overridden', async () => {
        await auth.handleLoginRedirect({
          accessToken: tokens.standardAccessTokenParsed,
          idToken: tokens.standardIdTokenParsed
        }, '/overridden');
        expect(auth.getOriginalUri).not.toHaveBeenCalledWith(undefined);
        expect(auth.removeOriginalUri).toHaveBeenCalledWith(undefined);
        expect(window.location.replace).toHaveBeenCalledWith('/overridden');
      });
    });

    describe('no tokens are passed, login redirect flow', () => {
      beforeEach(() => {
        jest.spyOn(auth, 'isLoginRedirect').mockReturnValue(true);
      });
      it('should get tokens from the callback url', async () => {
        auth.token.parseFromUrl.mockResolvedValue({
          tokens: {
            accessToken: tokens.standardAccessTokenParsed,
            idToken: tokens.standardIdTokenParsed
          }
        });

        await auth.handleLoginRedirect();
        expect(auth.getOriginalUri).toHaveBeenCalledWith(undefined);
        expect(auth.removeOriginalUri).toHaveBeenCalled();
        expect(window.location.replace).toHaveBeenCalledWith('/fakeuri');
      });

      it('originalUri can be overridden', async () => {
        auth.token.parseFromUrl.mockResolvedValue({
          tokens: {
            accessToken: tokens.standardAccessTokenParsed,
            idToken: tokens.standardIdTokenParsed
          }
        });
        await auth.handleLoginRedirect(null, '/overridden');
        expect(auth.getOriginalUri).not.toHaveBeenCalledWith();
        expect(auth.removeOriginalUri).toHaveBeenCalledWith(undefined);
        expect(window.location.replace).toHaveBeenCalledWith('/overridden');
      });

      describe('with state', () => {
        beforeEach(() => {
          jest.spyOn(mocked.parseFromUrl, 'parseOAuthResponseFromUrl').mockResolvedValue({
            state: 'mock-state'
          });
          auth.token.parseFromUrl.mockResolvedValue({
            tokens: {
              accessToken: tokens.standardAccessTokenParsed,
              idToken: tokens.standardIdTokenParsed
            }
          });
        });
        it('passes state to `getOriginalUri`', async () => {
          jest.spyOn(auth, 'getOriginalUri');
          await auth.handleLoginRedirect();
          expect(mocked.parseFromUrl.parseOAuthResponseFromUrl).toHaveBeenCalledWith(auth, {});
          expect(auth.getOriginalUri).toHaveBeenCalledWith('mock-state');
          expect(window.location.replace).toHaveBeenCalledWith('/fakeuri');
        });
        it('can override originalUri', async () => {
          jest.spyOn(auth, 'getOriginalUri');
          const originalUri = '/overridden';
          await auth.handleLoginRedirect(null, originalUri);
          expect(mocked.parseFromUrl.parseOAuthResponseFromUrl).toHaveBeenCalledWith(auth, {});
          expect(auth.getOriginalUri).not.toHaveBeenCalled();
          expect(window.location.replace).toHaveBeenCalledWith('/overridden');
        });
      });
    });

    it('should use options.restoreOriginalUri if provided', async () => {
      auth.options.restoreOriginalUri = jest.fn();
      auth.token.parseFromUrl.mockResolvedValue({
        tokens: {
          accessToken: tokens.standardAccessTokenParsed,
          idToken: tokens.standardIdTokenParsed
        }
      });
      auth.isLoginRedirect = jest.fn().mockReturnValue(true);
      await auth.handleLoginRedirect();
      expect(auth.getOriginalUri).toHaveBeenCalled();
      expect(auth.removeOriginalUri).toHaveBeenCalled();
      expect(auth.options.restoreOriginalUri).toHaveBeenCalledWith(auth, '/fakeuri');
      expect(window.location.replace).not.toHaveBeenCalled();
    });

    it('should be a no-op if neither tokens are provided, nor under login redirect flow', async () => {
      auth.isLoginRedirect = jest.fn().mockReturnValue(false);
      await auth.handleLoginRedirect();
      expect(auth.getOriginalUri).not.toHaveBeenCalled();
      expect(auth.removeOriginalUri).not.toHaveBeenCalled();
      expect(window.location.replace).not.toHaveBeenCalled();
    });

    it('will not redirect if parseFromUrl throws an error', async () => {
      const error = new Error('mock error');
      auth.token.parseFromUrl.mockImplementation(async () => {
        throw error;
      });
      auth.isLoginRedirect = jest.fn().mockReturnValue(true);
      let errorThrown = false;
      try {
        await auth.handleLoginRedirect();
      } catch (e) {
        expect(e).toBe(error);
        errorThrown = true;
      }
      expect(errorThrown).toBe(true);
      await auth.authStateManager.updateAuthState();
      expect(auth.getOriginalUri).toHaveBeenCalled();
      expect(auth.removeOriginalUri).not.toHaveBeenCalled();
      expect(window.location.replace).not.toHaveBeenCalled();
    });

    it('will call updateAuthState if parseFromUrl throws an error', async () => {
      const error = new Error('mock error');
      auth.authStateManager.updateAuthState = jest.fn();
      auth.token.parseFromUrl.mockImplementation(async () => {
        throw error;
      });
      auth.isLoginRedirect = jest.fn().mockReturnValue(true);
      let errorThrown = false;
      try {
        await auth.handleLoginRedirect();
      } catch (e) {
        expect(e).toBe(error);
        errorThrown = true;
      }
      expect(errorThrown).toBe(true);
      expect(auth.authStateManager.updateAuthState).toHaveBeenCalled();
    });

  });

});
