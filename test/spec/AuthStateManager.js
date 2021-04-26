/* global window, StorageEvent */

import Emitter from 'tiny-emitter';
import { AuthStateManager, DEFAULT_AUTH_STATE } from '../../lib/AuthStateManager';
import { OktaAuth, AuthSdkError } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import waitFor from '@okta/test.support/waitFor';

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

describe('AuthStateManager', () => {
  let sdkMock;

  beforeEach(function() {
    const emitter = new Emitter();
    sdkMock = {
      options: {},
      emitter,
      tokenManager: {
        on: jest.fn().mockImplementation((event, handler) => {
          sdkMock.emitter.on(event, handler);
        }),
        getOptions: jest.fn().mockReturnValue({ 
          storageKey: 'okta-token-storage' 
        })
      }
    };
  });

  describe('constructor', () => {
    it('should listen on "added" and "removed" events from TokenManager', () => {
      new AuthStateManager(sdkMock); // eslint-disable-line no-new
      expect(sdkMock.tokenManager.on).toHaveBeenCalledWith('added', expect.any(Function));
      expect(sdkMock.tokenManager.on).toHaveBeenCalledWith('removed', expect.any(Function));
    });

    it('should call updateAuthState when "added" event emitted', () => {
      const instance = new AuthStateManager(sdkMock);
      instance.updateAuthState = jest.fn();
      instance._setLogOptions = jest.fn();
      sdkMock.emitter.emit('added', 'fakeKey', 'fakeToken', { timestamp: 111 });
      expect(instance._setLogOptions).toHaveBeenCalledWith({ event: 'added', key: 'fakeKey', token: 'fakeToken' });
      expect(instance.updateAuthState).toHaveBeenCalled();
    });

    it('should call updateAuthState when "removed" event emitted', () => {
      const instance = new AuthStateManager(sdkMock);
      instance.updateAuthState = jest.fn();
      instance._setLogOptions = jest.fn();
      sdkMock.emitter.emit('removed', 'fakeKey', 'fakeToken', { timestamp: 111 });
      expect(instance._setLogOptions).toHaveBeenCalledWith({ event: 'removed', key: 'fakeKey', token: 'fakeToken' });
      expect(instance.updateAuthState).toHaveBeenCalled();
    });

    it('should not call updateAuthState if events is neither "added" nor "removed"', () => {
      const instance = new AuthStateManager(sdkMock);
      instance.updateAuthState = jest.fn();
      sdkMock.emitter.emit('fakeEvent');
      expect(instance.updateAuthState).not.toHaveBeenCalled();
    });

    it('should throw AuthSdkError if no emitter in sdk', () => {
      delete sdkMock.emitter;
      try {
        new AuthStateManager(sdkMock); // eslint-disable-line no-new
      } catch (err) {
        expect(err).toBeInstanceOf(AuthSdkError);
        expect(err.message).toBe('Emitter should be initialized before AuthStateManager');
      }
    });

    it('should initial with default authState', () => {
      const instance = new AuthStateManager(sdkMock);
      expect(instance._authState).toMatchObject(DEFAULT_AUTH_STATE);
    });
  });

  describe('getAuthState', () => {
    it('should return authState', () => {
      const instance = new AuthStateManager(sdkMock);
      expect(instance.getAuthState()).toMatchObject(DEFAULT_AUTH_STATE);
    });
  });

  describe('updateAuthState', () => {
    beforeEach(() => {
      sdkMock.tokenManager.getTokens = jest.fn()
        .mockResolvedValueOnce({ accessToken: 'fakeAccessToken0', idToken: 'fakeIdToken0' })
        .mockResolvedValueOnce({ accessToken: 'fakeAccessToken1', idToken: 'fakeIdToken1' });
      sdkMock.tokenManager.getOptions = jest.fn().mockReturnValue({ 
        autoRenew: true, 
        autoRemove: true 
      });
      sdkMock.tokenManager.hasExpired = jest.fn().mockReturnValue(false);
    });

    describe('browser', () => {
      if (typeof window === 'undefined') {
        return;
      }
      it('should only trigger authStateManager.updateAuthState once when localStorage changed from other dom', () => {
        jest.useFakeTimers();
        const auth = createAuth();
        auth.authStateManager.updateAuthState = jest.fn();
        auth.tokenManager.start(); // uses TokenService / crossTabs
        // simulate localStorage change from other dom context
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'okta-token-storage', 
          newValue: '{"idToken": "fake_id_token"}',
          oldValue: '{}'
        }));
        jest.runAllTimers();
        expect(auth.authStateManager.updateAuthState).toHaveBeenCalledTimes(1);
        jest.useRealTimers();
        auth.tokenManager.stop();
      });
    });

    it('should emit an authState with isAuthenticated === true', () => {
      expect.assertions(2);
      return new Promise(resolve => {
        const instance = new AuthStateManager(sdkMock);
        const handler = jest.fn();
        instance.subscribe(handler);
        instance.updateAuthState();

        setTimeout(() => {
          expect(handler).toHaveBeenCalledTimes(1);
          expect(handler).toHaveBeenCalledWith({

            isAuthenticated: true,
            idToken: 'fakeIdToken0',
            accessToken: 'fakeAccessToken0'
          });
          resolve();
        }, 100);
      });
    });

    it('should emit only latest authState', () => {
      expect.assertions(2);
      return new Promise(resolve => {
        const instance = new AuthStateManager(sdkMock);
        const handler = jest.fn();
        instance.subscribe(handler);
        instance.updateAuthState();
        instance.updateAuthState();

        setTimeout(() => {
          expect(handler).toHaveBeenCalledTimes(1);
          expect(handler).toHaveBeenCalledWith({
            isAuthenticated: true,
            idToken: 'fakeIdToken1',
            accessToken: 'fakeAccessToken1'
          });
          resolve();
        }, 100);
      });
    });

    it('should handle both updateAuthState if the previous one has finished before the second one start', () => {
      expect.assertions(3);
      return new Promise(resolve => {
        const instance = new AuthStateManager(sdkMock);
        const handler = jest.fn();
        instance.subscribe(handler);
        instance.updateAuthState();
        setTimeout(() => {
          instance.updateAuthState();
        }, 50);
        
        setTimeout(() => {
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
          resolve();
        }, 100);
      });
    });

    it('should evaluate authState based on "transformAuthState" callback if it\'s provided', () => {
      const fakeAuthState = {
        accessToken: 'fakeAccessToken0',
        idToken: 'fakeIdToken0',
        isAuthenticated: false,
      };
      sdkMock.options.transformAuthState = jest.fn().mockResolvedValue(fakeAuthState);
      expect.assertions(3);
      return new Promise(resolve => {
        const instance = new AuthStateManager(sdkMock);
        const handler = jest.fn();
        instance.subscribe(handler);
        instance.updateAuthState();

        setTimeout(() => {
          expect(sdkMock.options.transformAuthState).toHaveBeenCalledTimes(1);
          expect(handler).toHaveBeenCalledTimes(1);
          expect(handler).toHaveBeenCalledWith(fakeAuthState);
          resolve();
        }, 100);
      });
    });

    it('should evaluate expired token as null with isPending state as true', () => {
      expect.assertions(2);
      jest.spyOn(sdkMock.tokenManager, 'hasExpired')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const instance = new AuthStateManager(sdkMock);
      const handler = jest.fn();
      instance.subscribe(handler);
      instance.updateAuthState();
      
      return waitFor(() => {
        return handler.mock.calls.length > 0;
      }).then(() => {
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith({
          accessToken: 'fakeAccessToken0',
          idToken: null,
          isAuthenticated: false,
          isPending: true,
        });
      });
    });

    it('should evaluate expired token as null with isPending state as false if both autoRenew and autoRemove are off', () => {
      expect.assertions(2);
      sdkMock.tokenManager.hasExpired = jest.fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      sdkMock.tokenManager.getOptions = jest.fn().mockReturnValue({ 
        autoRenew: false, 
        autoRemove: false 
      });
      return new Promise(resolve => {
        const instance = new AuthStateManager(sdkMock);
        const handler = jest.fn();
        instance.subscribe(handler);
        instance.updateAuthState();
        
        setTimeout(() => {
          expect(handler).toHaveBeenCalledTimes(1);
          expect(handler).toHaveBeenCalledWith({
            accessToken: 'fakeAccessToken0',
            idToken: null,
            isAuthenticated: false,
            isPending: false,
          });
          resolve();
        }, 100);
      });
    });

    it('should emit error in authState if transformAuthState throws error', () => {
      expect.assertions(2);
      const error = new Error('fake error');
      const fakeAuthState = {
        accessToken: 'fakeAccessToken0',
        idToken: 'fakeIdToken0',
        isAuthenticated: false,
        isPending: false,
        error
      };
      sdkMock.options.transformAuthState = jest.fn().mockRejectedValue(error);
      return new Promise(resolve => {
        const instance = new AuthStateManager(sdkMock);
        const handler = jest.fn();
        instance.subscribe(handler);
        instance.updateAuthState();
        
        setTimeout(() => {
          expect(handler).toHaveBeenCalledTimes(1);
          expect(handler).toHaveBeenCalledWith(fakeAuthState);
          resolve();
        }, 100);
      });
    });

    it('should stop and evaluate at the 10th update if too many updateAuthState happen concurrently', () => {
      sdkMock.tokenManager.getTokens = jest.fn();
      for (let i = 0; i < 100; i++) {
        sdkMock.tokenManager.getTokens = sdkMock.tokenManager.getTokens
          .mockResolvedValueOnce({ 
            accessToken: `fakeAccessToken${i}`,
            idToken: `fakeIdToken${i}`,
          });
      }

      return new Promise(resolve => {
        const instance = new AuthStateManager(sdkMock);
        const handler = jest.fn();
        instance.subscribe(handler);
        for (let i = 0; i < 100; i++) {
          instance.updateAuthState();
        }

        setTimeout(() => {
          expect(handler).toHaveBeenCalledTimes(1);
          expect(handler).toHaveBeenCalledWith({
            accessToken: 'fakeAccessToken10',
            idToken: 'fakeIdToken10',
            isAuthenticated: true,
            isPending: false,
          });
          resolve();
        }, 100);
      });
    });

    it('should emit unique authState object', () => {
      expect.assertions(2);
      sdkMock.tokenManager.getTokens = jest.fn()
        .mockResolvedValueOnce({ accessToken: 'fakeAccessToken0', idToken: 'fakeIdToken0' })
        .mockResolvedValueOnce({ accessToken: 'fakeAccessToken1', idToken: 'fakeIdToken1' });
      return new Promise(resolve => {
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
        instance.updateAuthState();
        setTimeout(() => {
          instance.updateAuthState();
        }, 50);
        setTimeout(() => {
          expect(handler).toHaveBeenCalledTimes(2);
          resolve();
        }, 100);
      });
    });

    it('should only emit same authState once', () => {
      expect.assertions(1);
      sdkMock.tokenManager.getTokens = jest.fn()
        .mockResolvedValue({ accessToken: 'fakeAccessToken0', idToken: 'fakeIdToken0' });
      return new Promise(resolve => {
        const instance = new AuthStateManager(sdkMock);
        const handler = jest.fn();
        instance.subscribe(handler);
        instance.updateAuthState();
        setTimeout(() => {
          instance.updateAuthState();
        }, 50);
        setTimeout(() => {
          expect(handler).toHaveBeenCalledTimes(1);
          resolve();
        }, 100);
      });
    });

    it('should only trigger authStateManager.updateAuthState once when call tokenManager.add', () => {
      const auth = createAuth();
      auth.authStateManager.updateAuthState = jest.fn();
      auth.tokenManager.add('idToken', tokens.standardIdTokenParsed);
      expect(auth.authStateManager.updateAuthState).toHaveBeenCalledTimes(1);
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
