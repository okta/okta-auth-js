import Emitter from 'tiny-emitter';
import AuthStateManager, { 
  DEFAULT_AUTH_STATE, 
  EVENT_AUTH_STATE_CHANGE 
} from '../../lib/AuthStateManager';
import { AuthSdkError } from '../../lib/errors';
import { resolve } from 'path';

describe('AuthStateManager', () => {
  let sdkMock;

  beforeEach(function() {
    sdkMock = {
      options: {},
      emitter: new Emitter(),
      tokenManager: {
        on: jest.fn().mockImplementation((event, handler) => {
          sdkMock.emitter.on(event, handler)
        })
      }
    };
  });

  describe('constructor', () => {
    it('should listen on "added", "renewed" and "removed" events from TokenManaget', () => {
      new AuthStateManager(sdkMock);
      expect(sdkMock.tokenManager.on).toHaveBeenCalledWith('added', expect.any(Function));
      expect(sdkMock.tokenManager.on).toHaveBeenCalledWith('renewed', expect.any(Function));
      expect(sdkMock.tokenManager.on).toHaveBeenCalledWith('removed', expect.any(Function));
    });

    it('should call updateAuthState when "added" event emitted', () => {
      const instance = new AuthStateManager(sdkMock);
      instance.updateAuthState = jest.fn();
      sdkMock.emitter.emit('added', 'fakeKey', 'fakeToken');
      expect(instance.updateAuthState).toHaveBeenCalledWith({ event: 'added', key: 'fakeKey', token: 'fakeToken' });
    });

    it('should call updateAuthState when "renewed" event emitted', () => {
      const instance = new AuthStateManager(sdkMock);
      instance.updateAuthState = jest.fn();
      sdkMock.emitter.emit('renewed', 'fakeKey', 'fakeToken');
      expect(instance.updateAuthState).toHaveBeenCalledWith({ event: 'renewed', key: 'fakeKey', token: 'fakeToken' });
    });

    it('should call updateAuthState when "renewed" event emitted', () => {
      const instance = new AuthStateManager(sdkMock);
      instance.updateAuthState = jest.fn();
      sdkMock.emitter.emit('removed', 'fakeKey', 'fakeToken');
      expect(instance.updateAuthState).toHaveBeenCalledWith({ event: 'removed', key: 'fakeKey', token: 'fakeToken' });
    });

    it('should not call updateAuthState if events is not any of "added", "renewed" or "removed"', () => {
      const instance = new AuthStateManager(sdkMock);
      instance.updateAuthState = jest.fn();
      sdkMock.emitter.emit('fakeEvent');
      expect(instance.updateAuthState).not.toHaveBeenCalled();
    });

    it('should throw AuthSdkError if no emitter in sdk', () => {
      delete sdkMock.emitter;
      try {
        new AuthStateManager(sdkMock);
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
      sdkMock.tokenManager.hasExpired = jest.fn().mockReturnValue(false);
    });

    it('should emit an authState with isAuthenticated === true', () => {
      expect.assertions(2);
      return new Promise(resolve => {
        const instance = new AuthStateManager(sdkMock);
        instance.updateAuthState();
        const handler = jest.fn();
        instance.onAuthStateChange(handler);

        setTimeout(() => {
          expect(handler).toHaveBeenCalledTimes(1);
          expect(handler).toHaveBeenCalledWith({
            isPending: false,
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
        instance.updateAuthState();
        instance.updateAuthState();
        const handler = jest.fn();
        instance.onAuthStateChange(handler);

        setTimeout(() => {
          expect(handler).toHaveBeenCalledTimes(1);
          expect(handler).toHaveBeenCalledWith({
            isPending: false,
            isAuthenticated: true,
            idToken: 'fakeIdToken1',
            accessToken: 'fakeAccessToken1'
          })
          resolve();
        }, 100);
      });
    });

    it('should handle both updateAuthState if the previous one has finished before the second one start', () => {
      expect.assertions(3);
      return new Promise(resolve => {
        const instance = new AuthStateManager(sdkMock);
        instance.updateAuthState();
        setTimeout(() => {
          instance.updateAuthState();
        }, 50);
        const handler = jest.fn();
        instance.onAuthStateChange(handler);

        setTimeout(() => {
          expect(handler).toHaveBeenCalledTimes(2);
          expect(handler).toHaveBeenCalledWith({
            isPending: false,
            isAuthenticated: true,
            idToken: 'fakeIdToken0',
            accessToken: 'fakeAccessToken0'
          });
          expect(handler).toHaveBeenCalledWith({
            isPending: false,
            isAuthenticated: true,
            idToken: 'fakeIdToken1',
            accessToken: 'fakeAccessToken1'
          });
          resolve();
        }, 100);
      });
    });

    it('should evaluate authState.isAuthenticated based on "isAuthenticated" callback if it\'s provided', () => {
      sdkMock.options.isAuthenticated = jest.fn().mockResolvedValue(false);
      expect.assertions(3);
      return new Promise(resolve => {
        const instance = new AuthStateManager(sdkMock);
        instance.updateAuthState();
        const handler = jest.fn();
        instance.onAuthStateChange(handler);

        setTimeout(() => {
          expect(sdkMock.options.isAuthenticated).toHaveBeenCalledTimes(1);
          expect(handler).toHaveBeenCalledTimes(1);
          expect(handler).toHaveBeenCalledWith({
            accessToken: 'fakeAccessToken0',
            idToken: 'fakeIdToken0',
            isAuthenticated: false,
            isPending: false,
          });
          resolve();
        }, 100);
      });
    });

    it('should evaluate expired token as null', () => {
      expect.assertions(2);
      sdkMock.tokenManager.hasExpired = jest.fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      return new Promise(resolve => {
        const instance = new AuthStateManager(sdkMock);
        instance.updateAuthState();
        const handler = jest.fn();
        instance.onAuthStateChange(handler);

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
        for (let i = 0; i < 100; i++) {
          instance.updateAuthState();
        }
        const handler = jest.fn();
        instance.onAuthStateChange(handler);

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
  });

  describe('onAuthStateChange', () => {
    it('should add "authStateChange" listener on sdk.emitter', () => {
      jest.spyOn(Emitter.prototype, 'on');
      const handler = jest.fn();
      const instance = new AuthStateManager(sdkMock);
      instance.onAuthStateChange(handler);
      expect(sdkMock.emitter.on).toHaveBeenCalledWith(EVENT_AUTH_STATE_CHANGE, handler);
    });
  });

  describe('offAuthStateChange', () => {
    it('should remove "authStateChange" listener from sdk.emitter', () => {
      jest.spyOn(Emitter.prototype, 'off');
      const handler = jest.fn();
      const instance = new AuthStateManager(sdkMock);
      instance.offAuthStateChange(handler);
      expect(sdkMock.emitter.off).toHaveBeenCalledWith(EVENT_AUTH_STATE_CHANGE, handler);
    });
  });
});
