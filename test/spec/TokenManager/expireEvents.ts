import { TokenManager } from '../../../lib/TokenManager';

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

  function createInstance(options = null) {
    testContext.instance = new TokenManager(testContext.sdkMock, options);
  }

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
    it('does not call `setExpireEventTimeout` if the value is a refreshToken', () => {
      const a = { a: true };
      const b = { b: true };
      const c = { c: true, refreshToken: true };
      testContext.storage = {
        a, b, c
      };
      testContext.instance.setExpireEventTimeoutAll();
      expect(testContext.instance.setExpireEventTimeout).toHaveBeenCalledTimes(2);
      expect(testContext.instance.setExpireEventTimeout).toHaveBeenNthCalledWith(1, 'a', a);
      expect(testContext.instance.setExpireEventTimeout).toHaveBeenNthCalledWith(2, 'b', b);
    });
  });

});