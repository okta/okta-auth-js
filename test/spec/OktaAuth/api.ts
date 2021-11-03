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
jest.mock('../../../lib/tx');

import { 
  OktaAuth, 
  AuthApiError,
} from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import {postToTransaction} from '../../../lib/tx';
import { APIError, isAccessToken, isIDToken } from '../../../lib/types';

describe('OktaAuth (api)', function() {
  let auth;
  let issuer;

  beforeEach(function() {
    issuer =  'http://my-okta-domain';
    auth = new OktaAuth({ issuer, pkce: false });
  });

  it('is a valid constructor', function() {
    expect(auth instanceof OktaAuth).toBe(true);
  });

  describe('service methods', () => {
    beforeEach(() => {
      jest.spyOn(auth.token, 'isLoginRedirect').mockReturnValue(false);
    });
    afterEach(() => {
      auth.stop();
    });

    describe('start', () => {
      it('starts the token service', () => {
        jest.spyOn(auth.tokenManager, 'start');
        auth.start();
        expect(auth.tokenManager.start).toHaveBeenCalled(); 
      });
      it('updates auth state', () => {
        jest.spyOn(auth.authStateManager, 'updateAuthState');
        auth.start();
        expect(auth.authStateManager.updateAuthState).toHaveBeenCalled(); 
      });
      it('should not update auth state during login redirect', () => {
        jest.spyOn(auth.authStateManager, 'updateAuthState');
        jest.spyOn(auth.token, 'isLoginRedirect').mockReturnValue(true);
        auth.start();
        expect(auth.authStateManager.updateAuthState).not.toHaveBeenCalled(); 
      });
    });

    describe('stop', () => {
      it('stops the token service', () => {
        jest.spyOn(auth.tokenManager, 'stop');
        auth.start();
        auth.stop();
        expect(auth.tokenManager.stop).toHaveBeenCalled(); 
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
    it('should call signIn() with provided options', async () => {
      await auth.signIn(options);
      expect(auth.signInWithCredentials).toHaveBeenCalledWith(options);
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
      var testError = new AuthApiError({ errorCode: 'E0000007' } as unknown as APIError);
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

  describe('isAuthenticated', () => {
    beforeEach(function() {
      auth = new OktaAuth({ issuer, pkce: false, tokenManager: {
        autoRenew: false,
        autoRemove: false,
      } });
    });

    it('returns true if accessToken and idToken exist and are not expired', async () => {
      jest.spyOn(auth.tokenManager, 'getTokensSync').mockReturnValue({
        accessToken: { fake: true },
        idToken: { fake: true }
      });
      jest.spyOn(auth.tokenManager, 'hasExpired').mockReturnValue(false);
      const res = await auth.isAuthenticated();
      expect(res).toBe(true);
      expect(auth.tokenManager.getTokensSync).toHaveBeenCalled();
      expect(auth.tokenManager.hasExpired).toHaveBeenCalledTimes(2);
    });

    it('returns false if accessToken does not exist', async () => {
      jest.spyOn(auth.tokenManager, 'getTokensSync').mockReturnValue({
        accessToken: null,
        idToken: { fake: true }
      });
      jest.spyOn(auth.tokenManager, 'hasExpired').mockReturnValue(false);
      const res = await auth.isAuthenticated();
      expect(res).toBe(false);
      expect(auth.tokenManager.getTokensSync).toHaveBeenCalled();
      expect(auth.tokenManager.hasExpired).toHaveBeenCalledTimes(1);
    });

    it('returns false if idToken does not exist', async () => {
      jest.spyOn(auth.tokenManager, 'getTokensSync').mockReturnValue({
        accessToken: { fake: true },
        idToken: null
      });
      jest.spyOn(auth.tokenManager, 'hasExpired').mockReturnValue(false);
      const res = await auth.isAuthenticated();
      expect(res).toBe(false);
      expect(auth.tokenManager.getTokensSync).toHaveBeenCalled();
      expect(auth.tokenManager.hasExpired).toHaveBeenCalledTimes(1);
    });

    it('returns false if accessToken is expired', async () => {
      jest.spyOn(auth.tokenManager, 'getTokensSync').mockReturnValue({
        accessToken: { accessToken: true },
        idToken: { idToken: true }
      });
      jest.spyOn(auth.tokenManager, 'hasExpired').mockImplementation(token => {
        return isAccessToken(token) ? true : false;
      });
      const res = await auth.isAuthenticated();
      expect(res).toBe(false);
      expect(auth.tokenManager.getTokensSync).toHaveBeenCalled();
      expect(auth.tokenManager.hasExpired).toHaveBeenCalledTimes(2);
    });

    it('returns false if idToken is expired', async () => {
      jest.spyOn(auth.tokenManager, 'getTokensSync').mockReturnValue({
        accessToken: { accessToken: true },
        idToken: { idToken: true }
      });
      jest.spyOn(auth.tokenManager, 'hasExpired').mockImplementation(token => {
        return isIDToken(token) ? true : false;
      });
      const res = await auth.isAuthenticated();
      expect(res).toBe(false);
      expect(auth.tokenManager.getTokensSync).toHaveBeenCalled();
      expect(auth.tokenManager.hasExpired).toHaveBeenCalledTimes(2);
    });

    describe('if autoRenew=true', () => {
      beforeEach(function() {
        auth = new OktaAuth({ issuer, pkce: false, tokenManager: {
          autoRenew: true,
          autoRemove: false,
        } });
      });

      it('renew expired accessToken and return true', async () => {
        jest.spyOn(auth.tokenManager, 'getTokensSync').mockReturnValue({
          accessToken: { accessToken: true },
          idToken: { idToken: true }
        });
        jest.spyOn(auth.tokenManager, 'hasExpired').mockImplementation(token => {
          return isAccessToken(token) ? true : false;
        });
        jest.spyOn(auth.tokenManager, 'renew').mockReturnValue(true);
        const res = await auth.isAuthenticated();
        expect(res).toBe(true);
        expect(auth.tokenManager.getTokensSync).toHaveBeenCalled();
        expect(auth.tokenManager.hasExpired).toHaveBeenCalledTimes(2);
        expect(auth.tokenManager.renew).toHaveBeenCalledTimes(1);
        expect(auth.tokenManager.renew).toHaveBeenCalledWith('accessToken');
      });
  
      it('renew expired idToken and return true', async () => {
        jest.spyOn(auth.tokenManager, 'getTokensSync').mockReturnValue({
          accessToken: { accessToken: true },
          idToken: { idToken: true }
        });
        jest.spyOn(auth.tokenManager, 'hasExpired').mockImplementation(token => {
          return isIDToken(token) ? true : false;
        });
        jest.spyOn(auth.tokenManager, 'renew').mockReturnValue(true);
        const res = await auth.isAuthenticated();
        expect(res).toBe(true);
        expect(auth.tokenManager.getTokensSync).toHaveBeenCalled();
        expect(auth.tokenManager.hasExpired).toHaveBeenCalledTimes(2);
        expect(auth.tokenManager.renew).toHaveBeenCalledTimes(1);
        expect(auth.tokenManager.renew).toHaveBeenCalledWith('idToken');
      });
    });

    describe('if autoRemove=true', () => {
      beforeEach(function() {
        auth = new OktaAuth({ issuer, pkce: false, tokenManager: {
          autoRenew: false,
          autoRemove: true,
        } });
      });

      it('remove expired accessToken and return false', async () => {
        jest.spyOn(auth.tokenManager, 'getTokensSync').mockReturnValue({
          accessToken: { accessToken: true },
          idToken: { idToken: true }
        });
        jest.spyOn(auth.tokenManager, 'hasExpired').mockImplementation(token => {
          return isAccessToken(token) ? true : false;
        });
        jest.spyOn(auth.tokenManager, 'remove').mockReturnValue(undefined);
        const res = await auth.isAuthenticated();
        expect(res).toBe(false);
        expect(auth.tokenManager.getTokensSync).toHaveBeenCalled();
        expect(auth.tokenManager.hasExpired).toHaveBeenCalledTimes(2);
        expect(auth.tokenManager.remove).toHaveBeenCalledTimes(1);
        expect(auth.tokenManager.remove).toHaveBeenCalledWith('accessToken');
      });
  
      it('remove expired idToken and return false', async () => {
        jest.spyOn(auth.tokenManager, 'getTokensSync').mockReturnValue({
          accessToken: { accessToken: true },
          idToken: { idToken: true }
        });
        jest.spyOn(auth.tokenManager, 'hasExpired').mockImplementation(token => {
          return isIDToken(token) ? true : false;
        });
        jest.spyOn(auth.tokenManager, 'remove').mockReturnValue(undefined);
        const res = await auth.isAuthenticated();
        expect(res).toBe(false);
        expect(auth.tokenManager.getTokensSync).toHaveBeenCalled();
        expect(auth.tokenManager.hasExpired).toHaveBeenCalledTimes(2);
        expect(auth.tokenManager.remove).toHaveBeenCalledTimes(1);
        expect(auth.tokenManager.remove).toHaveBeenCalledWith('idToken');
      });
    });
  });

  describe('getUser', () => {
    it('should call token.getUserInfo with tokens from tokenManager', async () => {
      jest.spyOn(auth.tokenManager, 'getTokensSync').mockReturnValue({
        idToken: tokens.standardIdTokenParsed,
        accessToken: tokens.standardAccessTokenParsed
      });
      jest.spyOn(auth.token, 'getUserInfo').mockReturnValue(undefined);
      await auth.getUser();
      expect(auth.token.getUserInfo).toHaveBeenCalledWith(tokens.standardAccessTokenParsed, tokens.standardIdTokenParsed);
    });
  });

  describe('getIdToken', () => {
    it('retrieves token from tokenManager', () => {
      jest.spyOn(auth.tokenManager, 'getTokensSync').mockReturnValue({
        idToken: tokens.standardIdTokenParsed
      });
      const retVal = auth.getIdToken();
      expect(retVal).toBe(tokens.standardIdToken);
    });

    it('should return undefined if no idToken in tokenManager', () => {
      jest.spyOn(auth.tokenManager, 'getTokensSync').mockReturnValue({});
      const retVal = auth.getIdToken();
      expect(retVal).toBe(undefined);
    });
  });

  describe('getAccessToken', () => {
    it('retrieves token from tokenManager', () => {
      jest.spyOn(auth.tokenManager, 'getTokensSync').mockReturnValue({
        accessToken: tokens.standardAccessTokenParsed
      });
      const retVal = auth.getAccessToken();
      expect(retVal).toBe(tokens.standardAccessToken);
    });

    it('should return undefined if no accessToken in tokenManager', async () => {
      jest.spyOn(auth.tokenManager, 'getTokensSync').mockReturnValue({});
      const retVal = auth.getAccessToken();
      expect(retVal).toBe(undefined);
    });
  });

  describe('isPKCE', () => {
    it('is true by default', () => {
      auth = new OktaAuth({ issuer });
      expect(auth.isPKCE()).toBe(true);
    });
    it('is false if pkce option is false', () => {
      auth = new OktaAuth({ issuer, pkce: false });
      expect(auth.isPKCE()).toBe(false);
    });
  });

  describe('hasResponseType', () => {
    it('returns true if responseType is a string', () => {
      auth = new OktaAuth({ issuer, responseType: 'fake' });
      expect(auth.hasResponseType('fake')).toBe(true);
    });
    it('returns true if responseType is an array', () => {
      auth = new OktaAuth({ issuer, responseType: ['fake', 'alsofake'] });
      expect(auth.hasResponseType('fake')).toBe(true);
    });
    it('returns false if responseType does not match string', () => {
      auth = new OktaAuth({ issuer, responseType: 'abc' });
      expect(auth.hasResponseType('fake')).toBe(false);
    });
    it('returns false if responseType does not match entry in array', () => {
      auth = new OktaAuth({ issuer, responseType: ['abc', 'def'] });
      expect(auth.hasResponseType('fake')).toBe(false);
    });
  });

  describe('isAuthorizationCodeFlow', () => {
    it('is false by default', () => {
      auth = new OktaAuth({ issuer });
      expect(auth.isAuthorizationCodeFlow()).toBe(false);
    });
    it('will be true if is "code"', () => {
      auth = new OktaAuth({ issuer, responseType: 'code' });
      expect(auth.isAuthorizationCodeFlow()).toBe(true);
    });
    it('will be true if responseType is ["code"]', () => {
      auth = new OktaAuth({ issuer, pkce: false, responseType: ['code'] });
      expect(auth.isAuthorizationCodeFlow()).toBe(true);
    });
    it('will be true if responseType is [..., "code"]', () => {
      auth = new OktaAuth({ issuer, pkce: false, responseType: ['abc', 'code'] });
      expect(auth.isAuthorizationCodeFlow()).toBe(true);
    });
  });

  describe('forgotPassword', () => {
    it('calls postToTransaction with correct url and options', async () => {
      const options = { fake: 'fake' };
      await auth.forgotPassword(options);
      expect(postToTransaction).toHaveBeenCalledWith(auth, '/api/v1/authn/recovery/password', options);
    });
  });

  describe('unlockAccount', () => {
    it('calls postToTransaction with correct url and options', async () => {
      const options = { fake: 'fake' };
      await auth.unlockAccount(options);
      expect(postToTransaction).toHaveBeenCalledWith(auth, '/api/v1/authn/recovery/unlock', options);
    });
  });

  describe('verifyRecoveryToken', () => {
    it('calls postToTransaction with correct url and options', async () => {
      const options = { fake: 'fake' };
      await auth.verifyRecoveryToken(options);
      expect(postToTransaction).toHaveBeenCalledWith(auth, '/api/v1/authn/recovery/token', options);
    });
  });
});
