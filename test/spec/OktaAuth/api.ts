/* eslint-disable no-new */
jest.mock('../../../lib/tx');

import { 
  OktaAuth, 
  AuthApiError,
} from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import {postToTransaction} from '../../../lib/tx';
import { APIError } from '../../../lib/types';

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
          resolve(undefined);
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
});
