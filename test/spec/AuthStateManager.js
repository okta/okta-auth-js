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


/* global window, StorageEvent */

import Emitter from 'tiny-emitter';
import { AuthStateManager, INITIAL_AUTH_STATE } from '../../lib/AuthStateManager';
import { OktaAuth, AuthSdkError } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';

function createAuth() {
  return new OktaAuth({
    pkce: false,
    issuer: 'https://auth-js-test.okta.com',
    clientId: 'NPSfOkH5eZrTy8PMDlvx',
    redirectUri: 'https://example.com/redirect',
    tokenManager: {
      autoRenew: false,
      autoRemove: false,
    }
  });
}

const wait = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));

describe('AuthStateManager', () => {
  let sdkMock;

  beforeEach(function() {
    const emitter = new Emitter();
    sdkMock = {
      options: {},
      emitter,
      isAuthenticated: () => Promise.resolve(true),
      tokenManager: {
        getTokensSync: () => {
          return {
            accessToken: 'fakeAccessToken0',
            idToken: 'fakeIdToken0'
          };
        },
        on: jest.fn().mockImplementation((event, handler) => {
          sdkMock.emitter.on(event, handler);
        }),
        getOptions: jest.fn().mockReturnValue({ 
          storageKey: 'okta-token-storage' 
        })
      }
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should listen on "added" and "removed" events from TokenManager', () => {
      new AuthStateManager(sdkMock); // eslint-disable-line no-new
      expect(sdkMock.tokenManager.on).toHaveBeenCalledWith('added', expect.any(Function));
      expect(sdkMock.tokenManager.on).toHaveBeenCalledWith('removed', expect.any(Function));
    });

    it('should call updateAuthState when "added" event emitted', (done) => {
      const instance = new AuthStateManager(sdkMock);
      jest.spyOn(instance, 'updateAuthState');
      instance._setLogOptions = jest.fn();
      sdkMock.emitter.emit('added', 'fakeKey', 'fakeToken', { timestamp: 111 });
      instance.subscribe(() => {
        expect(instance._setLogOptions).toHaveBeenCalledWith({ event: 'added', key: 'fakeKey', token: 'fakeToken' });
        expect(instance.updateAuthState).toHaveBeenCalled();
        done();
      });
    });

    it('should call updateAuthState when "removed" event emitted', (done) => {
      const instance = new AuthStateManager(sdkMock);
      jest.spyOn(instance, 'updateAuthState');
      instance._setLogOptions = jest.fn();
      sdkMock.emitter.emit('removed', 'fakeKey', 'fakeToken', { timestamp: 111 });
      instance.subscribe(() => {
        expect(instance._setLogOptions).toHaveBeenCalledWith({ event: 'removed', key: 'fakeKey', token: 'fakeToken' });
        expect(instance.updateAuthState).toHaveBeenCalled();
        done();
      });
    });

    it('should not call updateAuthState if events is neither "added" nor "removed"', (done) => {
      const instance = new AuthStateManager(sdkMock);
      jest.spyOn(instance, 'updateAuthState');
      sdkMock.emitter.on('fakeEvent', () => {
        expect(instance.updateAuthState).not.toHaveBeenCalled();
        done();
      });
      sdkMock.emitter.emit('fakeEvent');
    });

    it('should throw AuthSdkError if no emitter in sdk', () => {
      delete sdkMock.emitter;
      expect(() => new AuthStateManager(sdkMock)).toThrow(new AuthSdkError('Emitter should be initialized before AuthStateManager'));
    });

    it('should initialize authState', () => {
      const instance = new AuthStateManager(sdkMock);
      expect(instance._authState).toBe(INITIAL_AUTH_STATE);
    });
  });

  describe('getAuthState', () => {
    it('should return authState', () => {
      const instance = new AuthStateManager(sdkMock);
      instance._authState = { fake: true };
      expect(instance.getAuthState()).toBe(instance._authState);
    });
  });

  describe('updateAuthState', () => {

    describe('browser', () => {
      if (typeof window === 'undefined') {
        return;
      }
      it('should only trigger authStateManager.updateAuthState once when localStorage changed from other dom', (done) => {
        const auth = createAuth();
        jest.spyOn(auth.authStateManager, 'updateAuthState');
        auth.tokenManager.start(); // uses TokenService / crossTabs
        // simulate localStorage change from other dom context
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'okta-token-storage', 
          newValue: '{"idToken": "fake_id_token"}',
          oldValue: '{}'
        }));
        auth.authStateManager.subscribe(() => {
          expect(auth.authStateManager.updateAuthState).toHaveBeenCalledTimes(1);
          auth.tokenManager.stop();
          done();
        });
      });
    });

    it('should emit an authState with isAuthenticated', async () => {
      jest.spyOn(sdkMock, 'isAuthenticated').mockResolvedValue('fake');
      expect.assertions(2);
      const instance = new AuthStateManager(sdkMock);
      const handler = jest.fn();
      instance.subscribe(handler);
      await instance.updateAuthState();
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({
        isAuthenticated: 'fake',
        idToken: 'fakeIdToken0',
        accessToken: 'fakeAccessToken0'
      });
    });

    it('should emit only latest authState', async () => {
      jest.spyOn(sdkMock, 'isAuthenticated');
      expect.assertions(3);
      const instance = new AuthStateManager(sdkMock);
      const handler = jest.fn();
      instance.subscribe(handler);
      instance.updateAuthState();
      await instance.updateAuthState();
      expect(sdkMock.isAuthenticated).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({
        isAuthenticated: true,
        idToken: 'fakeIdToken0',
        accessToken: 'fakeAccessToken0'
      });
    });

    it('should handle both updateAuthState if the previous one has finished before the second one start', async () => {
      jest.spyOn(sdkMock.tokenManager, 'getTokensSync')
        .mockReturnValueOnce({ accessToken: 'fakeAccessToken0', idToken: 'fakeIdToken0' })
        .mockReturnValueOnce({ accessToken: 'fakeAccessToken1', idToken: 'fakeIdToken1' });
      expect.assertions(3);
      const instance = new AuthStateManager(sdkMock);
      const handler = jest.fn();
      instance.subscribe(handler);
      await instance.updateAuthState();
      await instance.updateAuthState();
      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenCalledWith({
        isAuthenticated: true,
        idToken: 'fakeIdToken0',
        accessToken: 'fakeAccessToken0'
      });
      expect(handler).toHaveBeenCalledWith({
        isAuthenticated: true,
        idToken: 'fakeIdToken1',
        accessToken: 'fakeAccessToken1'
      });
    });

    it('should evaluate authState based on "transformAuthState" callback if it\'s provided', async () => {
      const fakeAuthState = {
        accessToken: 'fakeAccessToken0',
        idToken: 'fakeIdToken0',
        isAuthenticated: false,
      };
      sdkMock.options.transformAuthState = jest.fn().mockResolvedValue(fakeAuthState);
      expect.assertions(3);
      const instance = new AuthStateManager(sdkMock);
      const handler = jest.fn();
      instance.subscribe(handler);
      await instance.updateAuthState();
      expect(sdkMock.options.transformAuthState).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(fakeAuthState);
    });

    it('should emit error in authState if transformAuthState throws error', async () => {
      expect.assertions(2);
      const error = new Error('fake error');
      const fakeAuthState = {
        accessToken: 'fakeAccessToken0',
        idToken: 'fakeIdToken0',
        isAuthenticated: false,
        error
      };
      sdkMock.options.transformAuthState = jest.fn().mockRejectedValue(error);
      const instance = new AuthStateManager(sdkMock);
      const handler = jest.fn();
      instance.subscribe(handler);
      await instance.updateAuthState();
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(fakeAuthState);
    });

    it('should stop and evaluate at the 10th update if too many updateAuthState happen concurrently', async () => {
      jest.spyOn(sdkMock, 'isAuthenticated');
      expect.assertions(3);
      const instance = new AuthStateManager(sdkMock);
      const handler = jest.fn();
      instance.subscribe(handler);
      for (let i = 0; i < 100; i++) {
        instance.updateAuthState();
      }
      await instance.updateAuthState();
      expect(sdkMock.isAuthenticated).toHaveBeenCalledTimes(11); // 10 times cancelled + 1 time resolved
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({
        accessToken: 'fakeAccessToken0',
        idToken: 'fakeIdToken0',
        isAuthenticated: true
      });
    });

    it('should emit unique authState object', async () => {
      jest.spyOn(sdkMock.tokenManager, 'getTokensSync')
        .mockReturnValueOnce({ accessToken: 'fakeAccessToken0', idToken: 'fakeIdToken0' })
        .mockReturnValueOnce({ accessToken: 'fakeAccessToken1', idToken: 'fakeIdToken1' });
      expect.assertions(2);
      const instance = new AuthStateManager(sdkMock);
      let prevAuthState;
      const handler = jest.fn().mockImplementation(authState => {
        if (!prevAuthState) {
          prevAuthState = authState;
        } else {
          expect(authState).not.toBe(prevAuthState);
        }
      });
      instance.subscribe(handler);
      await instance.updateAuthState();
      await instance.updateAuthState();
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should only emit same authState once', async () => {
      expect.assertions(1);
      const instance = new AuthStateManager(sdkMock);
      const handler = jest.fn();
      instance.subscribe(handler);
      await instance.updateAuthState();
      await instance.updateAuthState();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('evaluates authState based on the latest token event', async (done) => {
      const auth = createAuth();
      jest.spyOn(auth.authStateManager, 'updateAuthState');
      // add tokens async
      auth.tokenManager.add('idToken', tokens.standardIdTokenParsed)
      await wait(100);
      auth.tokenManager.add('accessToken', tokens.standardAccessTokenParsed);
      auth.authStateManager.subscribe((authState) => {
        expect(auth.authStateManager.updateAuthState).toHaveBeenCalledTimes(1);
        expect(authState.idToken).toEqual(tokens.standardIdTokenParsed);
        expect(authState.accessToken).toEqual(tokens.standardAccessTokenParsed);
        done();
      });
    });
  });

  describe('subscribe', () => {
    it('should add "authStateChange" listener on sdk.emitter', () => {
      jest.spyOn(Emitter.prototype, 'on');
      const handler = jest.fn();
      const instance = new AuthStateManager(sdkMock);
      instance.subscribe(handler);
      expect(sdkMock.emitter.on).toHaveBeenCalledWith('authStateChange', handler);
    });
  });

  describe('unsubscribe', () => {
    it('should remove "authStateChange" listener from sdk.emitter', () => {
      jest.spyOn(Emitter.prototype, 'off');
      const handler = jest.fn();
      const instance = new AuthStateManager(sdkMock);
      instance.unsubscribe(handler);
      expect(sdkMock.emitter.off).toHaveBeenCalledWith('authStateChange', handler);
    });
  });
});
