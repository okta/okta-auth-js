jest.mock('../../../lib/features', () => {
  return {
    isLocalhost: () => true, // to allow configuring expireEarlySeconds
    isIE11OrLess: () => false,
    isSafari18: () => false
  };
});

import { TokenManager } from '../../../lib/oidc/TokenManager';

const Emitter = require('tiny-emitter');

describe('expire events', () => {
  let testContext;

  beforeEach(function() {
    const emitter = new Emitter();
    const sdkMock = {
      options: {},
      storageManager: {
        getTokenStorage: jest.fn().mockReturnValue({
          getStorage: jest.fn().mockImplementation(() => testContext.storage)
        }),
      },
      emitter
    };

    testContext = {
      sdkMock,
      storage: {},
    };
  });

  function createInstance(options?) {
    testContext.instance = new TokenManager(testContext.sdkMock, options);
    jest.spyOn(testContext.instance.clock, 'now').mockReturnValue(0);
  }

  describe('setExpireEventTimeout', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(global, 'setTimeout');
      createInstance({
        expireEarlySeconds: 0
      });
    });
    it('calls setTimeout', () => {
      const expiresAt = testContext.instance.clock.now() + 10;
      const accessToken = { accessToken: true, expiresAt };
      testContext.instance.setExpireEventTimeout('accessToken', accessToken);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 10000);
    });

    it('does not set event for refresh tokens', () => {
      const refreshToken = { refreshToken: true };
      testContext.instance.setExpireEventTimeout('refreshToken', refreshToken);
      expect(setTimeout).not.toHaveBeenCalled();
    });

    it('calls `clearExpireEventTimeout`', () => {
      jest.spyOn(testContext.instance, 'clearExpireEventTimeout');
      const expiresAt = testContext.instance.clock.now() + 10;
      const accessToken = { accessToken: true, expiresAt };
      testContext.instance.setExpireEventTimeout('accessToken', accessToken);
      expect(testContext.instance.clearExpireEventTimeout).toHaveBeenCalledWith('accessToken');
    });

    it('calls `emitExpired` after timeout expires', () => {
      jest.spyOn(testContext.instance, 'emitExpired');
      const expiresAt = testContext.instance.clock.now() + 10;
      const accessToken = { accessToken: true, expiresAt };
      testContext.instance.setExpireEventTimeout('accessToken', accessToken);
      jest.advanceTimersByTime(9000);
      expect(testContext.instance.emitExpired).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1001);
      expect(testContext.instance.emitExpired).toHaveBeenCalledWith('accessToken', accessToken);
    });
  });

  describe('setExpireEventTimeoutAll', () => {
    beforeEach(() => {
      createInstance();
      jest.spyOn(testContext.instance, 'setExpireEventTimeout').mockReturnValue(null);
    });
    it('calls `setExpireEventTimeout` on all keys in storage', () => {
      const a = { a: true };
      const b = { b: true };
      const c = { c: true };
      testContext.storage = {
        a, b, c
      };
      testContext.instance.setExpireEventTimeoutAll();
      expect(testContext.instance.setExpireEventTimeout).toHaveBeenCalledTimes(3);
      expect(testContext.instance.setExpireEventTimeout).toHaveBeenNthCalledWith(1, 'a', a);
      expect(testContext.instance.setExpireEventTimeout).toHaveBeenNthCalledWith(2, 'b', b);
      expect(testContext.instance.setExpireEventTimeout).toHaveBeenNthCalledWith(3, 'c', c);
    });
  });

});