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


import { OktaAuth } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import util from '@okta/test.support/util';
import oauthUtil from '@okta/test.support/oauthUtil';
import SdkClock from '../../../lib/clock';
import * as features from '../../../lib/features';
import { TokenService } from '../../../lib/services/TokenService';
import storageUtil from '../../../lib/browser/browserStorage';
import { POST_SIGNOUT_STORAGE_NAME } from '../../../lib/constants';

const Emitter = require('tiny-emitter');

function createAuth(options) {
  options = options || {};
  options.tokenManager = options.tokenManager || {};
  jest.spyOn(SdkClock, 'create').mockReturnValue(new SdkClock(options.localClockOffset));
  return new OktaAuth({
    pkce: false,
    issuer: 'https://auth-js-test.okta.com',
    clientId: 'NPSfOkH5eZrTy8PMDlvx',
    redirectUri: 'https://example.com/redirect',
    storageUtil: options.storageUtil,
    tokenManager: {
      expireEarlySeconds: options.tokenManager.expireEarlySeconds || 0,
      storage: options.tokenManager.storage,
      storageKey: options.tokenManager.storageKey,
      autoRenew: options.tokenManager.autoRenew || false,
      autoRemove: options.tokenManager.autoRemove || false,
      secure: options.tokenManager.secure // used by cookie storage
    }
  });
}

function mockStorageUtil() {
  const _storageProvider = {
    getItem: jest.fn(),
    setItem: jest.fn()
  };
  return {
    _storageProvider,
    findStorageType: (type) => type,
    getStorageByType: () => {
      return _storageProvider;
    }
  };
}

describe('TokenManager', function() {
  let client;

  function setupSync(options = {}, start = false) {
    client = createAuth(options);
    // clear downstream listeners
    client.tokenManager.off('added');
    client.tokenManager.off('removed');

    if (start) {
      client.tokenManager.start();
    }
    return client;
  }

  beforeEach(function() {
    client = null;
  });
  afterEach(function() {
    if (client) {
      client.tokenManager.stop();
      client.tokenManager.clear();
    }
    jest.useRealTimers();
  });

  describe('service methods', () => {
    beforeEach(() => {
      setupSync();
    });
    describe('start', () => {
      it('instantiates the token service', () => {
        expect(client.tokenManager.service).not.toBeTruthy();
        client.tokenManager.start();
        expect(client.tokenManager.service).toBeTruthy();
      });
      it('starts the token service', () => {
        jest.spyOn(TokenService.prototype, 'start');
        client.tokenManager.start();
        expect(TokenService.prototype.start).toHaveBeenCalled();
      });
      describe('clears post signout tokens when start the token service', () => {
        const mockNow = 1000000;
        const removeItemMock = jest.fn();
        let mockMeta;
        beforeEach(() => {
          mockMeta = {
            clearTokens: true,
            timestamp: mockNow - 10 * 1000 // not expired
          };
          jest.spyOn(storageUtil, 'getSessionStorage').mockImplementation(() => ({
            getItem: () => JSON.stringify(mockMeta),
            removeItem: removeItemMock
          } as unknown as Storage));
          jest.spyOn(features, 'isBrowser').mockReturnValue(true);
          jest.spyOn(Date, 'now').mockReturnValue(mockNow);
          jest.spyOn(client.tokenManager, 'clear');
        });

        it('clears tokens when valid flag found in sessionStorage', () => {
          mockMeta = {
            clearTokens: true,
            timestamp: mockNow - 10 * 1000 // not expired
          };
          client.tokenManager.start();
          expect(removeItemMock).toHaveBeenCalledWith(POST_SIGNOUT_STORAGE_NAME);
          expect(client.tokenManager.clear).toHaveBeenCalled();
        });

        it('will not clear tokens when flag found in sessionStorage is expired', () => {
          mockMeta = {
            clearTokens: true,
            timestamp: mockNow - 31 * 1000 // expired
          };
          client.tokenManager.start();
          expect(removeItemMock).toHaveBeenCalledWith(POST_SIGNOUT_STORAGE_NAME);
          expect(client.tokenManager.clear).not.toHaveBeenCalled();
        });
      });
      it('stops existing service', () => {
        const myService = client.tokenManager.service = {
          stop: jest.fn()
        };
        client.tokenManager.start();
        expect(myService.stop).toHaveBeenCalled();
        expect(myService).not.toBe(client.tokenManager.service); 
      });
    });

    describe('stop', () => {
      it('stops the token service, if it exists', () => {
        const myService = client.tokenManager.service = {
          stop: jest.fn()
        };
        client.tokenManager.stop();
        expect(myService.stop).toHaveBeenCalled();
      });
      it('sets service instance to null', () => {
        client.tokenManager.service = {
          stop: jest.fn()
        };
        client.tokenManager.stop();
        expect(client.tokenManager.service).toBe(null); 
      });
      it('does not error if there is no service instance', () => {
        expect(client.tokenManager.service).toBe(undefined); 
        client.tokenManager.stop();
      });
    });

  });

  describe('Event emitter', function() {
    it('uses emitter from the SDK client', function() {
      jest.spyOn(Emitter.prototype, 'on');
      setupSync();
      var handlerFn = jest.fn();
      client.tokenManager.on('fake', handlerFn);
      var emitter = Emitter.prototype.on.mock.instances[0];
      expect(emitter).toBe(client.emitter);
      emitter.emit('fake');
      expect(handlerFn).toHaveBeenCalled();
    });

    it('Can add event callbacks using on()', function() {
      setupSync();
      var handler = jest.fn();
      client.tokenManager.on('fake', handler);
      var payload = { foo: 'bar' };
      client.emitter.emit('fake', payload);
      expect(handler).toHaveBeenCalledWith(payload);
    });

    it('Event callbacks can have an optional context', function() {
      setupSync();
      var context = jest.fn();
      var handler = jest.fn().mockImplementation(function() {
        expect(this).toBe(context);
      });
      client.tokenManager.on('fake', handler, context);
      var payload = { foo: 'bar' };
      client.emitter.emit('fake', payload);
      expect(handler).toHaveBeenCalledWith(payload);
    });

    it('Can remove event callbacks using off()', function() {
      setupSync();
      var handler = jest.fn();
      client.tokenManager.on('fake', handler);
      client.tokenManager.off('fake', handler);
      var payload = { foo: 'bar' };
      client.emitter.emit('fake', payload);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('storageKey', function() {
    it('Uses "okta-token-storage" by default', function() {
      const storageUtil = mockStorageUtil();
      setupSync({
        storageUtil
      });
      client.tokenManager.add('foo', tokens.standardIdTokenParsed);
      expect(storageUtil._storageProvider.setItem).toHaveBeenCalledWith('okta-token-storage', JSON.stringify({ foo: tokens.standardIdTokenParsed }));
    });
    it('Can use a custom value', function() {
      const storageUtil = mockStorageUtil();
      setupSync({
        storageUtil,
        tokenManager: {
          storageKey: 'custom1'
        }
      });
      client.tokenManager.add('foo', tokens.standardIdTokenParsed);
      expect(storageUtil._storageProvider.setItem).toHaveBeenCalledWith('custom1', JSON.stringify({ foo: tokens.standardIdTokenParsed }));
    });
  });
  describe('storage', function() {
    it('throws if storage option is unrecognized', function() {
      var fn = createAuth.bind(null, {
        tokenManager: {
          storage: 'unheardof'
        }
      });
      expect(fn).toThrowError('Unrecognized storage option');
    });
    it('has an in memory option', function() {
      // warp to time to ensure tokens aren't expired
      util.warpToUnixTime(tokens.standardIdTokenClaims.exp - 1);

      setupSync({
        tokenManager: {
          storage: 'memory'
        }
      });
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      return client.tokenManager.get('test-idToken')
        .then(function (value) {
          expect(value).toEqual(tokens.standardIdTokenParsed);
        });
    });
    it('accepts a custom provider', function() {
      var store = {};
      var provider = {
        getItem: jest.fn().mockImplementation(function(key) { 
          return store[key];
        }),
        setItem: jest.fn().mockImplementation(function(key, val) {
          store[key] = val;
        })
      };
      setupSync({
        tokenManager: {
          storage: provider
        }
      });
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      oauthUtil.expectTokenStorageToEqual(provider, {
        'test-idToken': tokens.standardIdTokenParsed
      });
      expect(provider.setItem).toHaveBeenCalled();
      expect(provider.getItem).toHaveBeenCalled();
    });
  });

  describe('add', function() {
    it('throws an error when attempting to add a non-token', function() {
      setupSync();
      try {
        client.tokenManager.add('test-idToken', [
          tokens.standardIdTokenParsed,
          tokens.standardIdTokenParsed
        ]);

        // Should never hit this
        expect(true).toEqual(false);
      } catch (e) {
        util.expectErrorToEqual(e, {
          name: 'AuthSdkError',
          message: 'Token must be an Object with scopes, expiresAt, and one of: an idToken, accessToken, or refreshToken property',
          errorCode: 'INTERNAL',
          errorSummary: 'Token must be an Object with scopes, expiresAt, and one of: an idToken, accessToken, or refreshToken property',
          errorLink: 'INTERNAL',
          errorId: 'INTERNAL',
          errorCauses: []
        });
      }
    });
  });

  describe('renew', function() {
    beforeEach(() => {
      jest.spyOn(features, 'isLocalhost').mockReturnValue(true);
      setupSync();
    });

    it('on success, emits "renewed" event with the new token', function() {
      expect.assertions(3);
      
      const idTokenKey = 'test-idToken';
      const origIdToken = tokens.standardIdTokenParsed;
      const renewedIdToken = Object.assign({}, origIdToken);
      client.tokenManager.add(idTokenKey, origIdToken);

      const accessTokenKey = 'test-accessToken';
      const origAccessToken = tokens.standardAccessTokenParsed;
      const renewedAccessToken = Object.assign({}, origAccessToken);
      client.tokenManager.add(accessTokenKey, origAccessToken);

      jest.spyOn(client.token, 'renewTokens').mockImplementation(function() {
        return Promise.resolve({ idToken: renewedIdToken, accessToken: renewedAccessToken });
      });
      const addedCallback = jest.fn();
      const renewedCallback = jest.fn();
      const removedCallback = jest.fn();
      client.tokenManager.on('added', addedCallback);
      client.tokenManager.on('renewed', renewedCallback);
      client.tokenManager.on('removed', removedCallback);
      return client.tokenManager.renew('test-idToken')
        .then(() => {
          expect(renewedCallback).toHaveBeenNthCalledWith(1, idTokenKey, renewedIdToken, origIdToken);
          expect(addedCallback).toHaveBeenNthCalledWith(1, idTokenKey, renewedIdToken);
          expect(removedCallback).toHaveBeenNthCalledWith(1, idTokenKey, origIdToken);
        });
    });

    it('multiple overlapping calls will produce a single request and promise', function() {
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      jest.spyOn(client.token, 'renewTokens').mockImplementation(function() {
        return Promise.resolve({ idToken: tokens.standardIdTokenParsed, accessToken: tokens.standardAccessTokenParsed });
      });
      var p1 = client.tokenManager.renew('test-idToken');
      var p2 = client.tokenManager.renew('test-idToken');
      expect(p1).toBe(p2);
      return Promise.all([p1, p2]);
    });

    it('multiple overlapping calls will produce a single request and promise (failure case)', function() {
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      jest.spyOn(client.token, 'renewTokens').mockImplementation(function() {
        return Promise.reject(new Error('expected'));
      });
      var p1 = client.tokenManager.renew('test-idToken');
      var p2 = client.tokenManager.renew('test-idToken');
      expect(p1).toBe(p2);
      return Promise.allSettled([p1, p2]).then(function(results) {
        expect(results).toHaveLength(2);
        results.forEach(function(result) {
          expect(result.status).toBe('rejected');
          util.expectErrorToEqual(result.reason, {
            name: 'Error',
            message: 'expected',
          });
        });
      });
    });

    it('sequential calls will produce a unique request and promise', function() {
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      jest.spyOn(client.token, 'renewTokens').mockImplementation(function() {
        return Promise.resolve({ idToken: tokens.standardIdTokenParsed, accessToken: tokens.standardAccessTokenParsed });
      });
      var p1 = client.tokenManager.renew('test-idToken').then(function() {
        var p2 = client.tokenManager.renew('test-idToken');
        expect(p1).not.toBe(p2);
        return p2;
      });
      return p1;
    });

    it('sequential calls will produce a unique request and promise (failure case)', function() {
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      jest.spyOn(client.token, 'renewTokens').mockImplementation(function() {
        return Promise.reject(new Error('expected'));
      });
      var p1 = client.tokenManager.renew('test-idToken').then(function() {
        expect(false).toBe(true);
      }).catch(function(err) {
        util.expectErrorToEqual(err, {
          name: 'Error',
          message: 'expected',
        });
        var p2 = client.tokenManager.renew('test-idToken');
        expect(p1).not.toBe(p2);
        return p2;
      }).then(function() {
        expect(false).toBe(true);
      }).catch(function(err) {
        util.expectErrorToEqual(err, {
          name: 'Error',
          message: 'expected',
        });
      });
      return p1;
    });
  });

  describe('autoRenew', function() {
    beforeEach(function() {
      jest.useFakeTimers();
      jest.spyOn(features, 'isLocalhost').mockReturnValue(true);
    });
    afterEach(async () => {
      jest.useRealTimers();
    });
    it('should register listener for "expired" event', function() {
      jest.spyOn(Emitter.prototype, 'on');
      setupSync({}, true);
      client.tokenManager.start();
      expect(Emitter.prototype.on).toHaveBeenCalledWith('expired', expect.any(Function));
    });

    it('emits "expired" on existing tokens even when autoRenew is disabled', function() {
      jest.useFakeTimers();
      setupSync({ tokenManager: { autoRenew: false } }, true);
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      var callback = jest.fn();
      client.tokenManager.on('expired', callback);
      util.warpByTicksToUnixTime(tokens.standardIdTokenParsed.expiresAt + 1);
      expect(callback).toHaveBeenCalledWith('test-idToken', tokens.standardIdTokenParsed);
    });

    it('emits "expired" on new tokens even when autoRenew is disabled', function() {
      jest.useFakeTimers();
      setupSync({ tokenManager: { autoRenew: false } }, true);
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      var callback = jest.fn();
      client.tokenManager.on('expired', callback);
      util.warpByTicksToUnixTime(tokens.standardIdTokenParsed.expiresAt + 1);
      expect(callback).toHaveBeenCalledWith('test-idToken', tokens.standardIdTokenParsed);
    });

    it('accounts for local clock offset when emitting "expired"', function() {
      util.warpToUnixTime(tokens.standardIdTokenParsed.expiresAt);
      var localClockOffset = -2000; // local client is 2 seconds fast
      setupSync({
        localClockOffset: localClockOffset
      }, true);
      var callback = jest.fn();
      client.tokenManager.on('expired', callback);
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      jest.advanceTimersByTime(0);
      expect(callback).not.toHaveBeenCalled();
      jest.advanceTimersByTime(-localClockOffset);
      expect(callback).toHaveBeenCalledWith('test-idToken', tokens.standardIdTokenParsed);
    });
  
    it('accounts for "expireEarlySeconds" option when emitting "expired"', function() {
      var expireEarlySeconds = 10;
      util.warpToUnixTime(tokens.standardIdTokenParsed.expiresAt - (expireEarlySeconds + 1));
      setupSync({
        tokenManager: {
          expireEarlySeconds: expireEarlySeconds
        }
      }, true);
      var callback = jest.fn();
      client.tokenManager.on('expired', callback);
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      jest.advanceTimersByTime(0);
      expect(callback).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledWith('test-idToken', tokens.standardIdTokenParsed);
    });

    describe('too many renew requests', () => {
      it('should emit too many renew error when latest 10 expired event happen in 30 seconds', () => {
        setupSync({
          tokenManager: { autoRenew: true }
        }, true);
        client.tokenManager.renew = jest.fn().mockImplementation(() => Promise.resolve());
        const handler = jest.fn().mockImplementation(err => {
          util.expectErrorToEqual(err, {
            name: 'AuthSdkError',
            message: 'Too many token renew requests',
            errorCode: 'INTERNAL',
            errorSummary: 'Too many token renew requests',
            errorLink: 'INTERNAL',
            errorId: 'INTERNAL',
            errorCauses: []
          });
        });
        client.tokenManager.on('error', handler);
        let startTime = Math.round(Date.now() / 1000);
        // 2 * 10 < 30 => emit error
        for (let i = 0; i < 10; i++) {
          util.warpToUnixTime(startTime);
          client.emitter.emit('expired');
          startTime = startTime + 2;
        }
        expect(handler).toHaveBeenCalledTimes(1);
        expect(client.tokenManager.renew).toHaveBeenCalledTimes(9);
      });

      it('should keep emitting errors if expired events keep emitting in 30s', () => {
        setupSync({
          tokenManager: { autoRenew: true }
        }, true);
        client.tokenManager.renew = jest.fn().mockImplementation(() => Promise.resolve());
        const handler = jest.fn();
        client.tokenManager.on('error', handler);
        let startTime = Math.round(Date.now() / 1000);
        // 2 * 10 < 30 => emit error
        for (let i = 0; i < 20; i++) {
          util.warpToUnixTime(startTime);
          client.emitter.emit('expired');
          startTime = startTime + 2;
        }
        expect(handler).toHaveBeenCalledTimes(11);
        expect(client.tokenManager.renew).toHaveBeenCalledTimes(9);
      });
  
      it('should not emit error if time diff for the latest 10 requests are more than 30s', () => {
        setupSync({
          tokenManager: { autoRenew: true }
        }, true);
        const handler = jest.fn();
        client.tokenManager.on('error', handler);
        client.tokenManager.renew = jest.fn().mockImplementation(() => Promise.resolve());
        let startTime = Math.round(Date.now() / 1000);
        // 5 * 10 > 30 => not emit error
        for (let i = 0; i < 20; i++) {
          util.warpToUnixTime(startTime);
          client.emitter.emit('expired');
          startTime = startTime + 5;
        }
        expect(handler).not.toHaveBeenCalled();
        expect(client.tokenManager.renew).toHaveBeenCalledTimes(20);
      });

      it('should resume autoRenew if requests become normal again', () => {
        setupSync({
          tokenManager: { autoRenew: true }
        }, true);
        const handler = jest.fn();
        client.tokenManager.on('error', handler);
        client.tokenManager.renew = jest.fn().mockImplementation(() => Promise.resolve());

        // trigger too many requests error
        // 10 * 2 < 30 => should emit error
        let startTime = Math.round(Date.now() / 1000);
        for (let i = 0; i < 20; i++) {
          util.warpToUnixTime(startTime);
          client.emitter.emit('expired');
          startTime = startTime + 2;
        }
        // resume to normal requests
        // wait 50s, then 10 * 5 > 30 => not emit error
        startTime = startTime + 50;
        util.warpToUnixTime(startTime);
        for (let i = 0; i < 10; i++) {
          util.warpToUnixTime(startTime);
          client.emitter.emit('expired');
          startTime = startTime + 5;
        }

        expect(handler).toHaveBeenCalledTimes(11);
        expect(client.tokenManager.renew).toHaveBeenCalledTimes(19);
      });
    });
  });

  describe('autoRemove', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it('should call tokenManager.remove() when autoRenew === false && autoRemove === true', () => {
      setupSync({ tokenManager: { autoRenew: false, autoRemove: true } }, true);
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      client.tokenManager.remove = jest.fn();
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      util.warpByTicksToUnixTime(tokens.standardIdTokenParsed.expiresAt + 1);
      expect(client.tokenManager.remove).toHaveBeenCalledWith('test-idToken');
    });

    it('should not call tokenManager.remove() when autoRenew === false && autoRemove === false', () => {
      setupSync({ tokenManager: { autoRenew: false, autoRemove: false } }, true);
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      client.tokenManager.remove = jest.fn();
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      util.warpByTicksToUnixTime(tokens.standardIdTokenParsed.expiresAt + 1);
      expect(client.tokenManager.remove).not.toHaveBeenCalled();
    });
  });

  // describe('get', function() {
  //   it('should throw AuthSdkError if autoRenew is turned on and app is in oauth callback state', async () => {
  //     delete global.window.location;
  //     global.window.location = {
  //       protocol: 'https:',
  //       hostname: 'somesite.local',
  //       search: '?code=fakecode'
  //     };
  //     client = new OktaAuth({
  //       pkce: true,
  //       issuer: 'https://auth-js-test.okta.com',
  //       clientId: 'foo'
  //     });
  
  //     try {
  //       await client.tokenManager.get();
  //     } catch (err) {
  //       expect(err).toBeInstanceOf(AuthSdkError);
  //       expect(err.message).toBe('The app should not attempt to call authorize API on callback. Authorize flow is already in process. Use parseFromUrl() to receive tokens.');
  //     }
  //   });
  // });

  describe('hasExpired', function() {
    beforeEach(() => {
      jest.spyOn(features, 'isLocalhost').mockReturnValue(true);
    });

    it('returns false for a token that has not expired', function() {
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      setupSync();
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      return client.tokenManager.get('test-idToken')
      .then(function(token) {
        expect(token).toBeTruthy();
        expect(client.tokenManager.hasExpired(token)).toBe(false);
      });
    });

    it('returns false when a token is not expired, accounting for local clock offset', function() {
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      setupSync({
        localClockOffset: -2000 // local clock is 2 seconds ahead of server
      });
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      // Set local time to server expiration. local clock offset should keep the token valid
      util.warpToUnixTime(tokens.standardIdTokenParsed.expiresAt + 1);
      return client.tokenManager.get('test-idToken')
      .then(function(token) {
        expect(token).toBeTruthy();
        expect(client.tokenManager.hasExpired(token)).toBe(false);
      });
    });

    it('returns true for a token that has expired', function() {
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      setupSync();
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      util.warpToUnixTime(tokens.standardIdTokenParsed.expiresAt + 1);
      return client.tokenManager.get('test-idToken')
      .then(function(token) {
        expect(token).toBeTruthy();
        expect(client.tokenManager.hasExpired(token)).toBe(true);
      });
    });

    it('returns true when a token is expired, accounting for local clock offset', function() {
      util.warpToUnixTime(tokens.standardIdTokenClaims.iat);
      setupSync({
        localClockOffset: 5000 // local clock is 5 seconds behind server
      });
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      // Set local time to server expiration minus 5 seconds
      util.warpToUnixTime(tokens.standardIdTokenParsed.expiresAt - 5);
      return client.tokenManager.get('test-idToken')
      .then(function(token) {
        expect(token).toBeTruthy();
        expect(client.tokenManager.hasExpired(token)).toBe(true);
      });
    });

  });

  describe('getTokens', () => {
    it('should get key agnostic tokens set from storage', () => {
      expect.assertions(2);
      setupSync();
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      client.tokenManager.add('test-accessToken', tokens.standardAccessTokenParsed);
      return client.tokenManager.getTokens()
      .then(({ accessToken, idToken }) => {
        expect(accessToken).toEqual(tokens.standardAccessTokenParsed);
        expect(idToken).toEqual(tokens.standardIdTokenParsed);
      });
    });

    it('should get only idToken from storage', () => {
      expect.assertions(2);
      setupSync();
      client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
      return client.tokenManager.getTokens()
      .then(({ accessToken, idToken }) => {
        expect(accessToken).toBeUndefined();
        expect(idToken).toEqual(tokens.standardIdTokenParsed);
      });
    });

    it('should get only accessToken from storage', () => {
      expect.assertions(2);
      setupSync();
      client.tokenManager.add('test-accessToken', tokens.standardAccessTokenParsed);
      return client.tokenManager.getTokens()
      .then(({ accessToken, idToken }) => {
        expect(idToken).toBeUndefined();
        expect(accessToken).toEqual(tokens.standardAccessTokenParsed);
      });
    });

    it('should get empty object if no token in storage', () => {
      expect.assertions(1);
      setupSync();
      return client.tokenManager.getTokens()
      .then((tokens) => {
        expect(tokens).toEqual({});
      });
    });
  });

  describe('setTokens', () => {
    let setItemMock;
    let storageProvider;
    beforeEach(() => {
      setItemMock = jest.fn();
      storageProvider = {
        getItem: jest.fn().mockReturnValue(JSON.stringify({})),
        setItem: setItemMock
      };
    });

    it('should add set tokens with provided token object (two tokens in object)', () => {
      setupSync({
        tokenManager: {
          storage: storageProvider
        }
      });
      const handler = jest.fn();
      client.tokenManager.on('added', handler);
      const tokensObj = { 
        idToken: tokens.standardIdTokenParsed,
        accessToken: tokens.standardAccessTokenParsed, 
      };
      client.tokenManager.setTokens(tokensObj);
      expect(setItemMock).toHaveBeenCalledWith('okta-token-storage', JSON.stringify(tokensObj));
      expect(setItemMock).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should add set tokens with provided token object (one tokens in object)', () => {
      setupSync({
        tokenManager: {
          storage: storageProvider
        }
      });
      const handler = jest.fn();
      client.tokenManager.on('added', handler);
      const tokensObj = { 
        idToken: tokens.standardIdTokenParsed
      };
      client.tokenManager.setTokens(tokensObj);
      expect(setItemMock).toHaveBeenCalledWith('okta-token-storage', JSON.stringify(tokensObj));
      expect(setItemMock).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should remove tokens if no token in tokenObject but tokens exist in storage', () => {
      storageProvider = {
        getItem: jest.fn().mockReturnValue(JSON.stringify({ 
          idToken: tokens.standardIdTokenParsed,
          accessToken: tokens.standardAccessTokenParsed, 
        })),
        setItem: setItemMock
      };
      setupSync({
        tokenManager: {
          storage: storageProvider
        }
      });
      const addedHandler = jest.fn();
      client.tokenManager.on('added', addedHandler);
      const renewHandler = jest.fn();
      client.tokenManager.on('renewed', renewHandler);
      const removedHandler = jest.fn();
      client.tokenManager.on('removed', removedHandler);
      const tokensObj = {};
      client.tokenManager.setTokens(tokensObj);
      expect(setItemMock).toHaveBeenCalledTimes(1);
      expect(setItemMock).toHaveBeenCalledWith('okta-token-storage', JSON.stringify(tokensObj));
      expect(addedHandler).not.toHaveBeenCalled();
      expect(renewHandler).not.toHaveBeenCalled();
      expect(removedHandler).toHaveBeenCalledTimes(2);
    });

    it('should add and remove tokens based on existing tokens from storage', () => {
      // add token if token is provided in setTokens object
      // remove token if there is existing token in storage, but not in setTokens object 
      storageProvider = {
        getItem: jest.fn().mockReturnValue(JSON.stringify({ 
          idToken: tokens.standardIdTokenParsed,
          accessToken: tokens.standardAccessTokenParsed, 
        })),
        setItem: setItemMock
      };
      setupSync({
        tokenManager: {
          storage: storageProvider
        }
      });
      const addedHandler = jest.fn();
      client.tokenManager.on('added', addedHandler);
      const removedHandler = jest.fn();
      client.tokenManager.on('removed', removedHandler);
      const renewHandler = jest.fn();
      client.tokenManager.on('renewed', renewHandler);
      const tokensObj = { 
        idToken: tokens.standardIdToken2Parsed,
      };
      client.tokenManager.setTokens(tokensObj);
      expect(setItemMock).toHaveBeenCalledTimes(1);
      expect(setItemMock).toHaveBeenCalledWith('okta-token-storage', JSON.stringify(tokensObj));
      expect(addedHandler).toHaveBeenCalledWith('idToken', tokens.standardIdToken2Parsed);
      expect(renewHandler).toHaveBeenCalledWith('idToken', tokens.standardIdToken2Parsed, tokens.standardIdTokenParsed);
      expect(removedHandler).toHaveBeenCalledWith('accessToken', tokens.standardAccessTokenParsed);
    });
  });
});


