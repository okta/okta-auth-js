import TransactionManager from '../../lib/TransactionManager';
import { RawIdxResponseFactory } from '@okta/test.support/idx';

describe('TransactionManager', () => {
  let transactionManager;
  let storageManager;
  let mockStorage;

  beforeEach(() => {
    transactionManager = null;
    storageManager = null;
    mockStorage = null;
    jest.spyOn(global.console, 'warn').mockReturnValue(null); // ignore storage warnings
  });

  function createMockStorage() {
    return {
      getStorage: jest.fn(),
      clearStorage: jest.fn()
    };
  }

  function createInstance() {
    mockStorage = createMockStorage();
    storageManager = {
      storageUtil: {},
      getTransactionStorage: jest.fn().mockReturnValue(mockStorage),
      getIdxResponseStorage: jest.fn().mockReturnValue(mockStorage),
      getLegacyPKCEStorage: jest.fn().mockReturnValue(mockStorage),
      getLegacyOAuthParamsStorage: jest.fn().mockReturnValue(mockStorage)
    };
    transactionManager = new TransactionManager({ storageManager });
  }

  describe('clear', () => {
    beforeEach(() => {
      createInstance();
      Object.assign(storageManager.storageUtil, {
        testStorageType: jest.fn().mockReturnValue(true)
      });
    });
    it('clears transaction storage', () => {
      const clearStorage = jest.fn();
      jest.spyOn(storageManager, 'getTransactionStorage').mockReturnValue({
        clearStorage
      });
      transactionManager.clear();
      expect(clearStorage).toHaveBeenCalledWith();
    });
    it('clears idxResponse storage', () => {
      const clearStorage = jest.fn();
      jest.spyOn(storageManager, 'getIdxResponseStorage').mockReturnValue({
        clearStorage
      });
      transactionManager.clear();
      expect(clearStorage).toHaveBeenCalledWith();
    });
    // This is for compatibility with older versions of the signin widget. OKTA-304806
    it('pkce: clears legacy PKCE meta', () => {
      const clearStorage = jest.fn();
      jest.spyOn(storageManager, 'getLegacyPKCEStorage').mockReturnValue({
        clearStorage
      });
      transactionManager.clear({
        pkce: true
      });
      expect(storageManager.getLegacyPKCEStorage).toHaveBeenCalledTimes(2);
      expect(clearStorage).toHaveBeenCalledTimes(2);
      expect(storageManager.getLegacyPKCEStorage).toHaveBeenNthCalledWith(1, { storageType: 'localStorage' });
      expect(storageManager.getLegacyPKCEStorage).toHaveBeenNthCalledWith(2, { storageType: 'sessionStorage' });
    });
  });
  describe('save', () => {
    let setStorage;
    let getStorage;
    let meta;
    beforeEach(() => {
      createInstance();
      setStorage = jest.fn();
      getStorage = jest.fn();
      jest.spyOn(storageManager, 'getTransactionStorage').mockReturnValue({
        setStorage,
        getStorage
      });
      meta = { codeVerifier: 'fake', redirectUri: 'http://localhost/fake' };
      transactionManager.save(meta);
    });
    it('saves to transaction storage', () => {
      expect(setStorage).toHaveBeenCalledWith(meta);
    });
  });

  describe('load', () => {
    let meta;
    beforeEach(() => {
      createInstance();
      Object.assign(storageManager.storageUtil, {
        testStorageType: jest.fn().mockReturnValue(true)
      });
      meta = { codeVerifier: 'fake', redirectUri: 'http://localhost/fake' };
      jest.spyOn(transactionManager, 'clear').mockReturnValue(null);
      mockStorage.getStorage.mockReturnValue(meta);
    });
    it('can return the meta from transaction storage', () => {
      const res = transactionManager.load();
      expect(res.codeVerifier).toBe(meta.codeVerifier);
    });
    describe('pkce', () => {
      it('pkce: true throws an error if meta cannot be found', () => {
        const fn = () => {
          mockStorage.getStorage = jest.fn().mockReturnValue({}); // no transaction data
          transactionManager.load({
            pkce: true
          });
        };
        expect(fn).toThrowError('Could not load PKCE codeVerifier from storage');
      });
      it('pkce: false does not throw', () => {
        const fn = () => {
          mockStorage.getStorage = jest.fn().mockReturnValue({}); // no transaction data
          transactionManager.load({
            pkce: false
          });
        };
        expect(fn).not.toThrow();
      });
      it('calls clearLegacyPKCE', () => {
        jest.spyOn(transactionManager, 'clearLegacyPKCE').mockReturnValue(null);
        jest.spyOn(transactionManager, 'loadLegacyPKCE').mockReturnValue({
          codeVerifier: 'abc'
        });
        mockStorage.getStorage = jest.fn().mockReturnValue({}); // no transaction data
        transactionManager.load({
          pkce: true
        });
        expect(transactionManager.clearLegacyPKCE).toHaveBeenCalledWith();
      });
    });

    describe('oauth', () => {
      it('oauth: true throws an error if params cannot be found', () => {
        jest.spyOn(transactionManager, 'loadLegacyOAuthParams');
        const fn = () => {
          mockStorage.getStorage = jest.fn().mockReturnValue({}); // no transaction data
          transactionManager.load({
            oauth: true
          });
        };
        expect(fn).toThrowError('Unable to retrieve OAuth redirect params from storage');
        expect(transactionManager.loadLegacyOAuthParams).toHaveBeenCalledWith();
      });
      it('oauth: false does not throw', () => {
        jest.spyOn(transactionManager, 'loadLegacyOAuthParams');
        const fn = () => {
          mockStorage.getStorage = jest.fn().mockReturnValue({}); // no transaction data
          transactionManager.load({
            oauth: false
          });
        };
        expect(fn).not.toThrow();
        expect(transactionManager.loadLegacyOAuthParams).not.toHaveBeenCalledWith();
      });
      it('calls clearLegacyOAuthParams', () => {
        jest.spyOn(transactionManager, 'clearLegacyOAuthParams').mockReturnValue(null);
        jest.spyOn(transactionManager, 'loadLegacyOAuthParams').mockReturnValue({
          redirectUri: 'http://fake'
        });
        mockStorage.getStorage = jest.fn().mockReturnValue({}); // no transaction data
        transactionManager.load({
          oauth: true
        });
        expect(transactionManager.clearLegacyOAuthParams).toHaveBeenCalledWith();
      });
    });

    describe('pkce + oauth', () => {
      it('throws an error if OAuth params cannot be found', () => {
        const fn = () => {
          mockStorage.getStorage = jest.fn().mockReturnValue({}); // no transaction data
          transactionManager.load({
            pkce: true,
            oauth: true
          });
        };
        expect(fn).toThrowError('Unable to retrieve OAuth redirect params from storage');
      });
    });

     // This is for compatibility with older versions of the signin widget. OKTA-304806
    describe('if no transaction data, try to load from legacy PKCE meta', () => {
      beforeEach(() => {
        mockStorage.getStorage = jest.fn().mockReturnValue({}); // no transaction data
      });

      it('try localStorage first', () => {
        const getStorage = jest.fn().mockReturnValue(meta);
        jest.spyOn(storageManager, 'getLegacyPKCEStorage').mockReturnValue({
          getStorage,
          clearStorage: jest.fn()
        });
        const res = transactionManager.load({
          pkce: true
        });
        expect(res).toEqual(meta);
        expect(storageManager.getLegacyPKCEStorage).toHaveBeenCalledWith({ storageType: 'localStorage' });
        expect(getStorage).toHaveBeenCalledTimes(1);
      });

      it('check sessionStorage if localStorage has no data', () => {
        const getStorage = jest.fn();
        getStorage.mockReturnValueOnce({
        });
        getStorage.mockReturnValueOnce(meta);
        jest.spyOn(storageManager, 'getLegacyPKCEStorage').mockReturnValue({
          getStorage,
          clearStorage: jest.fn()
        });
        const res = transactionManager.load({
          pkce: true
        });
        expect(res).toEqual(meta);
        expect(storageManager.getLegacyPKCEStorage).toHaveBeenNthCalledWith(1, { storageType: 'localStorage' });
        expect(storageManager.getLegacyPKCEStorage).toHaveBeenNthCalledWith(2, { storageType: 'sessionStorage' });
        expect(getStorage).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('loadLegacyPKCE', () => {
    let meta;
    beforeEach(() => {
      meta = { codeVerifier: 'abc' };
      createInstance();
      mockStorage.getStorage = jest.fn().mockReturnValue(meta);
      Object.assign(storageManager.storageUtil, {
        testStorageType: jest.fn().mockReturnValue(true)
      });
    });

    it('try localStorage first', () => {
      const res = transactionManager.loadLegacyPKCE();
      expect(res).toEqual(meta);
      expect(storageManager.getLegacyPKCEStorage).toHaveBeenCalledTimes(1);
      expect(storageManager.getLegacyPKCEStorage).toHaveBeenNthCalledWith(1, { storageType: 'localStorage' });
    });

    it('check sessionStorage if localStorage has no data', () => {
      const getStorage = mockStorage.getStorage;
      getStorage.mockReturnValueOnce({});
      getStorage.mockReturnValueOnce(meta);
      const res = transactionManager.loadLegacyPKCE();
      expect(res).toEqual(meta);
      expect(storageManager.getLegacyPKCEStorage).toHaveBeenNthCalledWith(1, { storageType: 'localStorage' });
      expect(storageManager.getLegacyPKCEStorage).toHaveBeenNthCalledWith(2, { storageType: 'sessionStorage' });
      expect(getStorage).toHaveBeenCalledTimes(2);
    });
  });

  describe('loadLegacyOAuthParams', () => {
    let fakeParams;

    beforeEach(() => {
      fakeParams = { fake: 'fake', redirectUri: 'http://alsofake' };
      createInstance();
      Object.assign(storageManager.storageUtil, {
        testStorageType: jest.fn()
      });
    });

    describe('has sessionStorage', () => {
      it('should read from sessionStorage', () => {
        storageManager.storageUtil.testStorageType.mockReturnValueOnce(true);
        mockStorage.getStorage.mockReturnValue(fakeParams);
        const res = transactionManager.loadLegacyOAuthParams();
        expect(res).toEqual(fakeParams);
        expect(storageManager.getLegacyOAuthParamsStorage).toHaveBeenCalledTimes(1);
        expect(storageManager.getLegacyOAuthParamsStorage).toHaveBeenCalledWith({ storageType: 'sessionStorage' });
      });

      it('should read from cookies when no data in sessionStorage', () => {
        storageManager.storageUtil.testStorageType.mockReturnValue(true);
        mockStorage.getStorage.mockReturnValueOnce({});
        mockStorage.getStorage.mockReturnValueOnce(fakeParams);
        const res = transactionManager.loadLegacyOAuthParams();
        expect(res).toEqual(fakeParams);
        expect(storageManager.getLegacyOAuthParamsStorage).toHaveBeenCalledTimes(2);
        expect(storageManager.getLegacyOAuthParamsStorage).toHaveBeenNthCalledWith(1, { storageType: 'sessionStorage' });
        expect(storageManager.getLegacyOAuthParamsStorage).toHaveBeenNthCalledWith(2, { storageType: 'cookie' });
    });
    });

    describe('not has sessionStorage', () => {
      it('should read from cookies', () => {
        storageManager.storageUtil.testStorageType.mockReturnValueOnce(false);
        storageManager.storageUtil.testStorageType.mockReturnValueOnce(true);
        mockStorage.getStorage.mockReturnValue(fakeParams);
        const res = transactionManager.loadLegacyOAuthParams();
        expect(res).toEqual(fakeParams);
        expect(storageManager.getLegacyOAuthParamsStorage).toHaveBeenCalledTimes(1);
        expect(storageManager.getLegacyOAuthParamsStorage).toHaveBeenNthCalledWith(1, { storageType: 'cookie' });
      });
    });

    describe('no data in session or cookie', () => {
      it('throws', () => {
        const fn = () => {
          transactionManager.loadLegacyOAuthParams();
        };
        expect(fn).toThrowError('Unable to retrieve OAuth redirect params from storage');
      });
    });
  });

  describe('saveIdxResponse', () => {
    let setStorage;
    let meta;
    beforeEach(() => {
      createInstance();
      setStorage = jest.fn();
      meta = {};
    });
    it('saves to idxResponse storage', () => {
      jest.spyOn(storageManager, 'getIdxResponseStorage').mockReturnValue({
        setStorage
      });
      transactionManager.saveIdxResponse(meta);
      expect(setStorage).toHaveBeenCalledWith(meta);
    });
  });

  describe('loadIdxResponse', () => {
    let getStorage;
    let meta;
    beforeEach(() => {
      createInstance();
      meta = {};
    });
    it('loads from idxResponse storage', () => {
      const rawIdxResponse = RawIdxResponseFactory.build();
      getStorage = jest.fn().mockReturnValue(rawIdxResponse);
      jest.spyOn(storageManager, 'getIdxResponseStorage').mockReturnValue({
        getStorage
      });
      const res = transactionManager.loadIdxResponse();
      expect(getStorage).toHaveBeenCalled();
      expect(res).toEqual(rawIdxResponse);
    });
    it('returns null if idxResponse is not valid', () => {
      getStorage = jest.fn().mockReturnValue({});
      jest.spyOn(storageManager, 'getIdxResponseStorage').mockReturnValue({
        getStorage
      });
      const res = transactionManager.loadIdxResponse();
      expect(getStorage).toHaveBeenCalled();
      expect(res).toBeNull();
    });
  });

});
