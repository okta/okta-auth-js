import { TokenManager } from '../../../lib/TokenManager';

const Emitter = require('tiny-emitter');

describe('TokenManager remove', () => {
  let testContext;

  beforeEach(function() {
    const emitter = new Emitter();
    const tokenStorage = {
        getStorage: jest.fn().mockImplementation(() => testContext.storage),
        setStorage: jest.fn().mockImplementation(() => {})
    };
    const sdkMock = {
      options: {},
      storageManager: {
        getTokenStorage: jest.fn().mockReturnValue(tokenStorage),
      },
      emitter
    };

    testContext = {
      sdkMock,
      tokenStorage,
      storage: {}
    };
    testContext.instance = new TokenManager(testContext.sdkMock);
  });

  describe('with existing value', () => {
    beforeEach(() => {
      const foo = testContext.foo = {};
      const bar = testContext.bar = {};
      testContext.storage = {
        foo,
        bar
      };
    });

    it('clears the expire event', () => {
      jest.spyOn(testContext.instance, 'clearExpireEventTimeout');
      testContext.instance.remove('foo');
      expect(testContext.instance.clearExpireEventTimeout).toHaveBeenCalledWith('foo');
    });

    it('removes the key from storage', () => {
      jest.spyOn(testContext.tokenStorage, 'setStorage');
      testContext.instance.remove('foo');
      expect(testContext.tokenStorage.setStorage).toHaveBeenCalledWith({ bar: testContext.bar });
    });

    it('emits a removed event', () => {
      jest.spyOn(testContext.instance, 'emitRemoved');
      testContext.instance.remove('foo');
      expect(testContext.instance.emitRemoved).toHaveBeenCalledWith('foo', testContext.foo);
    });
  });

  describe('no existing value', () => {
    it('clears the expire event', () => {
      jest.spyOn(testContext.instance, 'clearExpireEventTimeout');
      testContext.instance.remove('foo');
      expect(testContext.instance.clearExpireEventTimeout).toHaveBeenCalledWith('foo');
    });

    it('removes the key from storage', () => {
      testContext.instance.remove('foo');
      expect(testContext.storage.foo).toBeUndefined();
    });

    it('emits a removed event', () => {
      jest.spyOn(testContext.instance, 'emitRemoved');
      testContext.instance.remove('foo');
      expect(testContext.instance.emitRemoved).toHaveBeenCalledWith('foo', undefined);
    });
  });

});