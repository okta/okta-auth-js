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


import TransactionManager from '../../lib/TransactionManager';
import { StorageManager } from '../../lib/StorageManager';
import { RawIdxResponseFactory } from '@okta/test.support/idx';

jest.mock('../../lib/util/sharedStorage', () => {
  return {
    clearTransactionFromSharedStorage: () => {},
    loadTransactionFromSharedStorage: () => {},
    pruneSharedStorage: () => {},
    saveTransactionToSharedStorage: () => {},
  };
});

const mocked = {
  sharedStorage: require('../../lib/util/sharedStorage')
};

describe('TransactionManager', () => {
  let testContext;

  function createMockStorage() {
    return {
      getStorage: jest.fn(),
      setStorage: jest.fn(),
      clearStorage: jest.fn()
    };
  }

  beforeEach(() => {
    const transactionStorage = createMockStorage();
    const idxResponseStorage = createMockStorage();
    const legacyPKCEStorage = createMockStorage();
    const legacyOAuthParamsStorage = createMockStorage();
    const sharedTransactionStorage = createMockStorage();
    const storageManager = {
      storageUtil: {},
      getTransactionStorage: jest.fn().mockReturnValue(transactionStorage),
      getIdxResponseStorage: jest.fn().mockReturnValue(idxResponseStorage),
      getLegacyPKCEStorage: jest.fn().mockReturnValue(legacyPKCEStorage),
      getLegacyOAuthParamsStorage: jest.fn().mockReturnValue(legacyOAuthParamsStorage),
      getSharedTransactionStorage: jest.fn().mockReturnValue(sharedTransactionStorage)
    } as unknown as StorageManager;
    const options = { storageManager };
    const meta = { 
      responseType: 'code',
      state: 'mock-state',
      nonce: 'mock-nonce',
      scopes: ['a', 'b'],
      clientId: 'mock-clientid',
      urls: {
        a: 'b'
      },
      ignoreSignature: true,
      redirectUri: 'http://localhost/fake',
      codeVerifier: 'fake'
    };
    testContext = {
      storageManager,
      transactionStorage,
      idxResponseStorage,
      legacyPKCEStorage,
      legacyOAuthParamsStorage,
      sharedTransactionStorage,
      options,
      meta
    };
    jest.spyOn(global.console, 'warn').mockReturnValue(undefined); // ignore storage warnings
  });

  function createInstance(additionalOptions = {}) {
    const { options } = testContext;
    const transactionManager = new TransactionManager(Object.assign(options, additionalOptions));
    Object.assign(testContext, {
      transactionManager
    });
  }

  describe('clear', () => {
    beforeEach(() => {
      createInstance();
      const { storageManager } = testContext;
      Object.assign(storageManager.storageUtil, {
        testStorageType: jest.fn().mockReturnValue(true)
      });
    });
    it('clears transaction storage', () => {
      const { transactionManager, transactionStorage } = testContext;
      transactionManager.clear();
      expect(transactionStorage.clearStorage).toHaveBeenCalledWith();
    });
    it('clears idxResponse storage', () => {
      const { transactionManager, idxResponseStorage } = testContext;
      transactionManager.clear();
      expect(idxResponseStorage.clearStorage).toHaveBeenCalledWith();
    });
    // This is for compatibility with older versions of the signin widget. OKTA-304806
    it('pkce: clears legacy PKCE meta', () => {
      const { storageManager, transactionManager, legacyPKCEStorage } = testContext;
      transactionManager.clear({
        pkce: true
      });
      expect(storageManager.getLegacyPKCEStorage).toHaveBeenCalledTimes(2);
      expect(legacyPKCEStorage.clearStorage).toHaveBeenCalledTimes(2);
      expect(storageManager.getLegacyPKCEStorage).toHaveBeenNthCalledWith(1, { storageType: 'localStorage' });
      expect(storageManager.getLegacyPKCEStorage).toHaveBeenNthCalledWith(2, { storageType: 'sessionStorage' });
    });

    describe('shared transaction storage', () => {
      beforeEach(() => {
        jest.spyOn(mocked.sharedStorage, 'clearTransactionFromSharedStorage');
      });
      it('by default, does not clear shared transaction', () => {
        const { transactionManager } = testContext;
        transactionManager.clear();
        expect(mocked.sharedStorage.clearTransactionFromSharedStorage).not.toHaveBeenCalled();
      });
      it('`clearSharedStorage` option with `state` in saved transaction meta will clear shared transaction meta', () => {
        const { transactionManager, transactionStorage, meta, storageManager } = testContext;
        transactionStorage.getStorage.mockReturnValue(meta);
        expect(meta.state).toBeTruthy();
        transactionManager.clear({ clearSharedStorage: true });
        expect(mocked.sharedStorage.clearTransactionFromSharedStorage).toHaveBeenCalledWith(storageManager, meta.state);
      });
      it('`clearSharedStorage` + `state` option will clear shared transaction meta', () => {
        const { transactionManager, storageManager } = testContext;
        const state = 'abc';
        transactionManager.clear({ clearSharedStorage: true, state });
        expect(mocked.sharedStorage.clearTransactionFromSharedStorage).toHaveBeenCalledWith(storageManager, state);
      });
      it('`clearSharedStorage` option without saved transaction meta will not clear shared transaction meta', () => {
        const { transactionManager } = testContext;
        transactionManager.clear({ clearSharedStorage: true });
        expect(mocked.sharedStorage.clearTransactionFromSharedStorage).not.toHaveBeenCalled();
      });
      it('can be disabled via TransactionManager `enableSharedStorage` option', () => {
        createInstance({ enableSharedStorage: false });
        const { transactionManager } = testContext;
        transactionManager.clear({ clearSharedStorage: true, state: 'abc' });
        expect(mocked.sharedStorage.clearTransactionFromSharedStorage).not.toHaveBeenCalled();
      });
    });
  });

  describe('save', () => {

    it('saves to transaction storage', () => {
      createInstance();
      const { storageManager, transactionManager, transactionStorage, meta } = testContext;
      transactionManager.save(meta);
      expect(storageManager.getTransactionStorage).toHaveBeenCalledWith();
      expect(transactionStorage.getStorage).toHaveBeenCalledWith();
      expect(transactionStorage.setStorage).toHaveBeenCalledWith(meta);
    });

    describe('oauth', () => {
      beforeEach(() => {
        const { storageManager } = testContext;
        const cookieStorage = {
          setItem: jest.fn()
        };
        storageManager.getStorage = jest.fn().mockImplementation((options) => {
          if (options.storageType !== 'cookie') {
            throw new Error(`unexpected storage type ${options.storageType}`);
          }
          return cookieStorage;
        });
        const sharedStorageObject = {};
        const sharedStorage = {
          setStorage: jest.fn(),
          getStorage: jest.fn().mockReturnValue(sharedStorageObject)
        };
        storageManager.getSharedTansactionStorage = jest.fn().mockReturnValue(sharedStorage);
        Object.assign(testContext, {
          cookieStorage,
          sharedStorage,
          sharedStorageObject
        });
      });

      it('by default, saves 3 cookies: params, nonce, state', () => {
        createInstance();
        const { transactionManager, meta, cookieStorage } = testContext;
        transactionManager.save(meta, { oauth: true });
        expect(cookieStorage.setItem).toHaveBeenCalledTimes(3);
        expect(cookieStorage.setItem).toHaveBeenNthCalledWith(1,
          'okta-oauth-redirect-params',
          '{"responseType":"code","state":"mock-state","nonce":"mock-nonce","scopes":["a","b"],"clientId":"mock-clientid","urls":{"a":"b"},"ignoreSignature":true}',
          null
        );
        expect(cookieStorage.setItem).toHaveBeenNthCalledWith(2,
          'okta-oauth-nonce',
          'mock-nonce',
          null
        );
        expect(cookieStorage.setItem).toHaveBeenNthCalledWith(3,
          'okta-oauth-state',
          'mock-state',
          null
        );
      });

      describe('saveParamsCookie', () => {
        beforeEach(() => {
          const { options } = testContext;
          options.saveNonceCookie = false;
          options.saveStateCookie = false;
        });
        it('is enabled by default', () => {
          createInstance();
          const { transactionManager, meta, cookieStorage } = testContext;
          transactionManager.save(meta, { oauth: true });
          expect(cookieStorage.setItem).toHaveBeenCalledWith(
            'okta-oauth-redirect-params',
            '{"responseType":"code","state":"mock-state","nonce":"mock-nonce","scopes":["a","b"],"clientId":"mock-clientid","urls":{"a":"b"},"ignoreSignature":true}',
            null
          );
        });
        it('can be disabled via option', () => {
          createInstance({ saveParamsCookie: false });
          const { transactionManager, meta, cookieStorage } = testContext;
          transactionManager.save(meta, { oauth: true });
          expect(cookieStorage.setItem).not.toHaveBeenCalled();
        });
      });

      describe('saveNonceCookie', () => {
        beforeEach(() => {
          const { options } = testContext;
          options.saveParamsCookie = false;
          options.saveStateCookie = false;
        });
        it('is enabled by default', () => {
          createInstance();
          const { transactionManager, meta, cookieStorage } = testContext;
          transactionManager.save(meta, { oauth: true });
          expect(cookieStorage.setItem).toHaveBeenCalledWith(
            'okta-oauth-nonce',
            'mock-nonce',
            null
          );
        });
        it('can be disabled via option', () => {
          createInstance({ saveNonceCookie: false });
          const { transactionManager, meta, cookieStorage } = testContext;
          transactionManager.save(meta, { oauth: true });
          expect(cookieStorage.setItem).not.toHaveBeenCalled();
        });
        it('will not set a cookie if there is no nonce', () => {
          createInstance();
          const { transactionManager, meta, cookieStorage } = testContext;
          delete meta.nonce;
          transactionManager.save(meta, { oauth: true });
          expect(cookieStorage.setItem).not.toHaveBeenCalled();
        });
      });

      describe('saveStateCookie', () => {
        beforeEach(() => {
          const { options } = testContext;
          options.saveParamsCookie = false;
          options.saveNonceCookie = false;
        });
        it('is enabled by default', () => {
          createInstance();
          const { transactionManager, meta, cookieStorage } = testContext;
          transactionManager.save(meta, { oauth: true });
          expect(cookieStorage.setItem).toHaveBeenCalledWith(
            'okta-oauth-state',
            'mock-state',
            null
          );
        });
        it('can be disabled via option', () => {
          createInstance({ saveStateCookie: false });
          const { transactionManager, meta, cookieStorage } = testContext;
          transactionManager.save(meta, { oauth: true });
          expect(cookieStorage.setItem).not.toHaveBeenCalled();
        });
        it('will not set a cookie if there is no state', () => {
          createInstance();
          const { transactionManager, meta, cookieStorage } = testContext;
          delete meta.state;
          transactionManager.save(meta, { oauth: true });
          expect(cookieStorage.setItem).not.toHaveBeenCalled();
        });
      });

      describe('shared transaction storage', () => {
        beforeEach(() => {
          jest.spyOn(mocked.sharedStorage, 'saveTransactionToSharedStorage');
        });
        it('saves to shared transaction storage by default', () => {
          createInstance();
          const { transactionManager, meta, storageManager } = testContext;
          transactionManager.save(meta, { oauth: true });
          expect(mocked.sharedStorage.saveTransactionToSharedStorage).toHaveBeenCalledWith(storageManager, meta.state, meta);
        });
        it('can be disabled via option', () => {
          createInstance({ enableSharedStorage: false });
          const { transactionManager, meta } = testContext;
          transactionManager.save(meta, { oauth: true });
          expect(mocked.sharedStorage.saveTransactionToSharedStorage).not.toHaveBeenCalled();
        });
        it('will not save if there is no state', () => {
          createInstance();
          const { transactionManager, meta } = testContext;
          delete meta.state;
          transactionManager.save(meta, { oauth: true });
          expect(mocked.sharedStorage.saveTransactionToSharedStorage).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('load', () => {
    beforeEach(() => {
      const { storageManager } = testContext;
      Object.assign(storageManager.storageUtil, {
        testStorageType: jest.fn().mockReturnValue(true)
      });
    });
    
    it('can return the meta from transaction storage', () => {
      createInstance();
      const { transactionManager, transactionStorage, meta } = testContext;
      transactionStorage.getStorage.mockReturnValue(meta);
      const res = transactionManager.load();
      expect(res.codeVerifier).toBe(meta.codeVerifier);
    });

    describe('shared storage', () => {
      beforeEach(() => {
        jest.spyOn(mocked.sharedStorage, 'loadTransactionFromSharedStorage');
        jest.spyOn(mocked.sharedStorage, 'pruneSharedStorage');
      });
      it('does not attempt to load from shared storage by default', () => {
        createInstance();
        const { transactionManager } = testContext;
        transactionManager.load();
        expect(mocked.sharedStorage.loadTransactionFromSharedStorage).not.toHaveBeenCalled();
      });
      it('will attempt to load from shared storage if state was passed in options', () => {
        createInstance();
        const { transactionManager, storageManager } = testContext;
        const state = 'some-value';
        transactionManager.load({
          state
        });
        expect(mocked.sharedStorage.loadTransactionFromSharedStorage).toHaveBeenCalledWith(storageManager, state);
      });
      it('will not attempt to load from shared storage when disabled via config even if state was passed in options', () => {
        createInstance({ enableSharedStorage: false });
        const { transactionManager } = testContext;
        transactionManager.load({
          state: 'some-value'
        });
        expect(mocked.sharedStorage.loadTransactionFromSharedStorage).not.toHaveBeenCalled();
      });
      it('will prune shared storage', () => {
        createInstance();
        const { transactionManager, storageManager } = testContext;
        transactionManager.load({
          state: 'some-value'
        });
        expect(mocked.sharedStorage.pruneSharedStorage).toHaveBeenCalledWith(storageManager);
      });
      it('will return value from shared storage, if valid', () => {
        createInstance();
        const { transactionManager, transactionStorage, meta } = testContext;
        const state = 'some-value';
        mocked.sharedStorage.loadTransactionFromSharedStorage.mockReturnValue(meta);
        const res = transactionManager.load({
          state
        });
        expect(res).toBe(meta);
        expect(transactionStorage.getStorage).not.toHaveBeenCalled();
      });
      it('will fallback to regular transaction storage if shared storage does not have valid meta', () => {
        createInstance();
        const { transactionManager, transactionStorage, meta } = testContext;
        const state = 'some-value';
        mocked.sharedStorage.loadTransactionFromSharedStorage.mockReturnValue({});
        transactionStorage.getStorage.mockReturnValue(meta);
        const res = transactionManager.load({
          state
        });
        expect(res).toBe(meta);
        expect(transactionStorage.getStorage).toHaveBeenCalled();
      });
    });

    describe('pkce', () => {
      it('pkce: true throws an error if meta cannot be found', () => {
        createInstance();
        const { transactionManager } = testContext;
        const fn = () => {
          transactionManager.load({
            pkce: true
          });
        };
        expect(fn).toThrowError('Could not load PKCE codeVerifier from storage');
      });
      it('pkce: false does not throw', () => {
        createInstance();
        const { transactionManager } = testContext;
        const fn = () => {
          transactionManager.load({
            pkce: false
          });
        };
        expect(fn).not.toThrow();
      });
      it('calls clearLegacyPKCE', () => {
        createInstance();
        const { legacyPKCEStorage, transactionStorage, transactionManager, meta } = testContext;
        jest.spyOn(transactionManager, 'clearLegacyPKCE').mockReturnValue(null);
        jest.spyOn(transactionManager, 'loadLegacyPKCE').mockReturnValue({
          codeVerifier: 'abc'
        });
        transactionStorage.getStorage.mockReturnValue({}); // nothing in transaction storage
        legacyPKCEStorage.getStorage.mockReturnValue(meta);
        transactionManager.load({
          pkce: true
        });
        expect(transactionManager.clearLegacyPKCE).toHaveBeenCalledWith();
      });
    });

    describe('oauth', () => {
      it('oauth: true throws an error if params cannot be found', () => {
        createInstance();
        const { transactionManager } = testContext;
        jest.spyOn(transactionManager, 'loadLegacyOAuthParams');
        const fn = () => {
          transactionManager.load({
            oauth: true
          });
        };
        expect(fn).toThrowError('Unable to retrieve OAuth redirect params from storage');
        expect(transactionManager.loadLegacyOAuthParams).toHaveBeenCalledWith();
      });
      it('oauth: false does not throw', () => {
        createInstance();
        const { transactionManager } = testContext;
        jest.spyOn(transactionManager, 'loadLegacyOAuthParams');
        const fn = () => {
          transactionManager.load({
            oauth: false
          });
        };
        expect(fn).not.toThrow();
        expect(transactionManager.loadLegacyOAuthParams).not.toHaveBeenCalledWith();
      });
      it('calls clearLegacyOAuthParams', () => {
        createInstance();
        const { transactionStorage, transactionManager } = testContext;
        jest.spyOn(transactionManager, 'clearLegacyOAuthParams').mockReturnValue(null);
        jest.spyOn(transactionManager, 'loadLegacyOAuthParams').mockReturnValue({
          redirectUri: 'http://fake'
        });
        transactionStorage.getStorage.mockReturnValue({}); // no transaction data
        transactionManager.load({
          oauth: true
        });
        expect(transactionManager.clearLegacyOAuthParams).toHaveBeenCalledWith();
      });
    });

    describe('pkce + oauth', () => {
      it('throws an error if OAuth params cannot be found', () => {
        createInstance();
        const { transactionManager } = testContext;
        const fn = () => {
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
        const { transactionStorage } = testContext;
        transactionStorage.getStorage.mockReturnValue({}); // no transaction data
      });

      it('try localStorage first', () => {
        createInstance();
        const { storageManager, transactionManager, meta } = testContext;
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
        createInstance();
        const { legacyPKCEStorage, storageManager, transactionManager, meta } = testContext;
        legacyPKCEStorage.getStorage.mockReturnValueOnce({});
        legacyPKCEStorage.getStorage.mockReturnValueOnce(meta);
        const res = transactionManager.load({
          pkce: true
        });
        expect(res).toEqual(meta);
        expect(storageManager.getLegacyPKCEStorage).toHaveBeenNthCalledWith(1, { storageType: 'localStorage' });
        expect(storageManager.getLegacyPKCEStorage).toHaveBeenNthCalledWith(2, { storageType: 'sessionStorage' });
        expect(legacyPKCEStorage.getStorage).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('loadLegacyPKCE', () => {
    beforeEach(() => {
      createInstance();
      const { storageManager } = testContext;
      Object.assign(storageManager.storageUtil, {
        testStorageType: jest.fn().mockReturnValue(true)
      });
    });

    it('try localStorage first', () => {
      const { storageManager, transactionManager, legacyPKCEStorage, meta } = testContext;
      legacyPKCEStorage.getStorage.mockReturnValue(meta);
      const res = transactionManager.loadLegacyPKCE();
      expect(res).toEqual(meta);
      expect(storageManager.getLegacyPKCEStorage).toHaveBeenCalledTimes(1);
      expect(storageManager.getLegacyPKCEStorage).toHaveBeenNthCalledWith(1, { storageType: 'localStorage' });
    });

    it('check sessionStorage if localStorage has no data', () => {
      const { legacyPKCEStorage, storageManager, transactionManager, meta } = testContext;
      const getStorage = legacyPKCEStorage.getStorage;
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
    beforeEach(() => {
      const fakeParams = { fake: 'fake', redirectUri: 'http://alsofake' };
      createInstance();
      const { storageManager } = testContext;
      Object.assign(storageManager.storageUtil, {
        testStorageType: jest.fn()
      });
      Object.assign(testContext, {
        fakeParams
      });
    });

    describe('has sessionStorage', () => {
      it('should read from sessionStorage', () => {
        const { storageManager, legacyOAuthParamsStorage, fakeParams, transactionManager } = testContext;
        storageManager.storageUtil.testStorageType.mockReturnValueOnce(true);
        legacyOAuthParamsStorage.getStorage.mockReturnValue(fakeParams);
        const res = transactionManager.loadLegacyOAuthParams();
        expect(res).toEqual(fakeParams);
        expect(storageManager.getLegacyOAuthParamsStorage).toHaveBeenCalledTimes(1);
        expect(storageManager.getLegacyOAuthParamsStorage).toHaveBeenCalledWith({ storageType: 'sessionStorage' });
      });

      it('should read from cookies when no data in sessionStorage', () => {
        const { storageManager, legacyOAuthParamsStorage, fakeParams, transactionManager } = testContext;
        storageManager.storageUtil.testStorageType.mockReturnValue(true);
        legacyOAuthParamsStorage.getStorage.mockReturnValueOnce({});
        legacyOAuthParamsStorage.getStorage.mockReturnValueOnce(fakeParams);
        const res = transactionManager.loadLegacyOAuthParams();
        expect(res).toEqual(fakeParams);
        expect(storageManager.getLegacyOAuthParamsStorage).toHaveBeenCalledTimes(2);
        expect(storageManager.getLegacyOAuthParamsStorage).toHaveBeenNthCalledWith(1, { storageType: 'sessionStorage' });
        expect(storageManager.getLegacyOAuthParamsStorage).toHaveBeenNthCalledWith(2, { storageType: 'cookie' });
    });
    });

    describe('not has sessionStorage', () => {
      it('should read from cookies', () => {
        const { storageManager, legacyOAuthParamsStorage, fakeParams, transactionManager } = testContext;
        storageManager.storageUtil.testStorageType.mockReturnValueOnce(false);
        storageManager.storageUtil.testStorageType.mockReturnValueOnce(true);
        legacyOAuthParamsStorage.getStorage.mockReturnValue(fakeParams);
        const res = transactionManager.loadLegacyOAuthParams();
        expect(res).toEqual(fakeParams);
        expect(storageManager.getLegacyOAuthParamsStorage).toHaveBeenCalledTimes(1);
        expect(storageManager.getLegacyOAuthParamsStorage).toHaveBeenNthCalledWith(1, { storageType: 'cookie' });
      });
    });

    describe('no data in session or cookie', () => {
      it('throws', () => {
        const { transactionManager } = testContext;
        const fn = () => {
          transactionManager.loadLegacyOAuthParams();
        };
        expect(fn).toThrowError('Unable to retrieve OAuth redirect params from storage');
      });
    });
  });

  describe('saveIdxResponse', () => {
    beforeEach(() => {
      createInstance();
      const setStorage = jest.fn();
      const meta = {};
      Object.assign(testContext, {
        setStorage,
        meta
      });
    });
    it('saves to idxResponse storage', () => {
      const { storageManager, setStorage, meta, transactionManager } = testContext;
      jest.spyOn(storageManager, 'getIdxResponseStorage').mockReturnValue({
        setStorage
      });
      transactionManager.saveIdxResponse(meta);
      expect(setStorage).toHaveBeenCalledWith(meta);
    });
  });

  describe('loadIdxResponse', () => {
    beforeEach(() => {
      createInstance();
    });
    it('loads from idxResponse storage', () => {
      const { transactionManager, idxResponseStorage } = testContext;
      const rawIdxResponse = RawIdxResponseFactory.build();
      idxResponseStorage.getStorage.mockReturnValue(rawIdxResponse);
      const res = transactionManager.loadIdxResponse();
      expect(idxResponseStorage.getStorage).toHaveBeenCalled();
      expect(res).toEqual(rawIdxResponse);
    });
    it('returns null if idxResponse is not valid', () => {
      const { transactionManager, idxResponseStorage } = testContext;
      const res = transactionManager.loadIdxResponse();
      expect(idxResponseStorage.getStorage).toHaveBeenCalled();
      expect(res).toBeNull();
    });
  });

  describe('clearIdxResponse', () => {
    beforeEach(() => {
      createInstance();
    });
    it('clears idxResponse storage', () => {
      const { transactionManager, idxResponseStorage } = testContext;
      transactionManager.clearIdxResponse();
      expect(idxResponseStorage.clearStorage).toHaveBeenCalledWith();
    });
  });
});
