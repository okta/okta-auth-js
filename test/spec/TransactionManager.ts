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


import { createTransactionManager } from '../../lib/oidc/TransactionManager';

jest.mock('../../lib/oidc/util/sharedStorage', () => {
  return {
    clearTransactionFromSharedStorage: () => {},
    loadTransactionFromSharedStorage: () => {},
    pruneSharedStorage: () => {},
    saveTransactionToSharedStorage: () => {},
  };
});

const mocked = {
  sharedStorage: require('../../lib/oidc/util/sharedStorage')
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
    const sharedTransactionStorage = createMockStorage();
    const storageManager = {
      storageUtil: {},
      getTransactionStorage: jest.fn().mockReturnValue(transactionStorage),
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
      sharedTransactionStorage,
      options,
      meta
    };
    jest.spyOn(global.console, 'warn').mockReturnValue(undefined); // ignore storage warnings
  });

  function createInstance(additionalOptions = {}) {
    const { options } = testContext;
    const TransactionManager = createTransactionManager();
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

    describe('shared transaction storage', () => {
      beforeEach(() => {
        jest.spyOn(mocked.sharedStorage, 'saveTransactionToSharedStorage');
      });
      it('saves to shared transaction storage by default', () => {
        createInstance();
        const { transactionManager, meta, storageManager } = testContext;
        transactionManager.save(meta);
        expect(mocked.sharedStorage.saveTransactionToSharedStorage).toHaveBeenCalledWith(storageManager, meta.state, meta);
      });
      it('can be disabled via option', () => {
        createInstance({ enableSharedStorage: false });
        const { transactionManager, meta } = testContext;
        transactionManager.save(meta);
        expect(mocked.sharedStorage.saveTransactionToSharedStorage).not.toHaveBeenCalled();
      });
      it('will not save if there is no state', () => {
        createInstance();
        const { transactionManager, meta } = testContext;
        delete meta.state;
        transactionManager.save(meta);
        expect(mocked.sharedStorage.saveTransactionToSharedStorage).not.toHaveBeenCalled();
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

  });

});
