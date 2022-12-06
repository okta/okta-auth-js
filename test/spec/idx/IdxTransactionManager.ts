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


import { createIdxTransactionManager } from '../../../lib/idx/IdxTransactionManager';
import { RawIdxResponseFactory } from '@okta/test.support/idx';

jest.mock('../../../lib/oidc/util/sharedStorage', () => {
  return {
    clearTransactionFromSharedStorage: () => {},
    loadTransactionFromSharedStorage: () => {},
    pruneSharedStorage: () => {},
    saveTransactionToSharedStorage: () => {},
  };
});

describe('IdxTransactionManager', () => {
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
    const sharedTransactionStorage = createMockStorage();
    const storageManager = {
      storageUtil: {},
      getTransactionStorage: jest.fn().mockReturnValue(transactionStorage),
      getIdxResponseStorage: jest.fn().mockReturnValue(idxResponseStorage),
      getSharedTransactionStorage: jest.fn().mockReturnValue(sharedTransactionStorage)
    };
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
      sharedTransactionStorage,
      options,
      meta
    };
    jest.spyOn(global.console, 'warn').mockReturnValue(undefined); // ignore storage warnings
  });

  function createInstance(additionalOptions = {}) {
    const { options } = testContext;
    const IdxTransactionManager = createIdxTransactionManager();
    const transactionManager = new IdxTransactionManager(Object.assign(options, additionalOptions));
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

    it('does not clear idxResponse storage if `clearIdxResponse` is false', () => {
      const { transactionManager, idxResponseStorage } = testContext;
      transactionManager.clear({ clearIdxResponse: false });
      expect(idxResponseStorage.clearStorage).not.toHaveBeenCalled();
    });
  });

  describe('saveIdxResponse', () => {
    beforeEach(() => {
      createInstance();
      const setStorage = jest.fn();
      const rawIdxResponse = RawIdxResponseFactory.build();
      const savedResponse = {
        rawIdxResponse,
        requestDidSucceed: true
      };
      Object.assign(testContext, {
        setStorage,
        savedResponse
      });
    });
    it('saves to idxResponse storage', () => {
      const { storageManager, setStorage, savedResponse, transactionManager } = testContext;
      jest.spyOn(storageManager, 'getIdxResponseStorage').mockReturnValue({
        setStorage
      });
      transactionManager.saveIdxResponse(savedResponse);
      expect(setStorage).toHaveBeenCalledWith(savedResponse);
    });
  });

  describe('loadIdxResponse', () => {
    beforeEach(() => {
      createInstance();
      const rawIdxResponse = RawIdxResponseFactory.build();
      const requestDidSucceed = true;
      const savedResponse = {
        rawIdxResponse,
        requestDidSucceed
      };
      testContext = {
        ...testContext,
        savedResponse
      };
    });
    it('loads from idxResponse storage', () => {
      const { transactionManager, idxResponseStorage, savedResponse } = testContext;
      idxResponseStorage.getStorage.mockReturnValue(savedResponse);
      const res = transactionManager.loadIdxResponse();
      expect(idxResponseStorage.getStorage).toHaveBeenCalled();
      expect(res).toEqual(savedResponse);
    });
    it('returns null if storage is empty', () => {
      const { transactionManager, idxResponseStorage } = testContext;
      idxResponseStorage.getStorage.mockReturnValue(undefined);
      const res = transactionManager.loadIdxResponse();
      expect(idxResponseStorage.getStorage).toHaveBeenCalled();
      expect(res).toBeNull();
    });
    it('returns null if idxResponse is not valid', () => {
      const { transactionManager, idxResponseStorage } = testContext;
      const savedResponse = { foo: 'bar' };
      idxResponseStorage.getStorage.mockReturnValue(savedResponse);
      const res = transactionManager.loadIdxResponse();
      expect(idxResponseStorage.getStorage).toHaveBeenCalled();
      expect(res).toBeNull();
    });
    describe('with options.stateHandle', () => {
      it('returns data if options.stateHandle matches saved stateHandle', () => {
        const { transactionManager, idxResponseStorage, savedResponse } = testContext;
        savedResponse.stateHandle = 'a';
        idxResponseStorage.getStorage.mockReturnValue(savedResponse);
        const res = transactionManager.loadIdxResponse({ stateHandle: 'a' });
        expect(idxResponseStorage.getStorage).toHaveBeenCalled();
        expect(res).toBe(savedResponse);
      });
    });
    describe('with options.interactionHandle', () => {
      it('returns null if options.interactionHandle does not match saved stateHandle', () => {
        const { transactionManager, idxResponseStorage, savedResponse } = testContext;
        idxResponseStorage.getStorage.mockReturnValue(savedResponse);
        const res = transactionManager.loadIdxResponse({ interactionHandle: 'a' });
        expect(idxResponseStorage.getStorage).toHaveBeenCalled();
        expect(res).toBeNull();
      });
      it('returns data if options.interactionHandle matches saved interactionHandle', () => {
        const { transactionManager, idxResponseStorage, savedResponse } = testContext;
        savedResponse.interactionHandle = 'a';
        idxResponseStorage.getStorage.mockReturnValue(savedResponse);
        const res = transactionManager.loadIdxResponse({ interactionHandle: 'a' });
        expect(idxResponseStorage.getStorage).toHaveBeenCalled();
        expect(res).toBe(savedResponse);
      });
    });
  });

  describe('clearIdxResponse', () => {
    beforeEach(() => {
      createInstance();
    });
    it('by default, clears idxResponse storage', () => {
      const { transactionManager, idxResponseStorage } = testContext;
      transactionManager.clearIdxResponse();
      expect(idxResponseStorage.clearStorage).toHaveBeenCalledWith();
    });
  });
});
