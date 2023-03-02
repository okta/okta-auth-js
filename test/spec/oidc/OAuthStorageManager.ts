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


import {
  SavedObject,
  CookieOptions, 
  StorageManagerOptions, 
  StorageOptions, 
  StorageProvider, 
  StorageType, 
  StorageUtil, 
} from '../../../lib/storage';
import { TransactionStorage, createOAuthStorageManager } from '../../../lib/oidc';

jest.mock('../../../lib/util', () => {
  return {
    warn: () => {}
  };
});

jest.mock('../../../lib/features', () => {
  return {
    isBrowser: () => {}
  };
});

const mocked = {
  util: require('../../../lib/util'),
  features: require('../../../lib/features')
};

describe('OAuthStorageManager', () => {

  const mockStorage = {};
  function mockStorageUtil(): StorageUtil {
    return {
      findStorageType: jest.fn().mockReturnValue('mock'),
      getStorageByType: jest.fn().mockReturnValue(mockStorage)
    } as unknown as StorageUtil;
  }

  function setup(options: StorageManagerOptions = {}, cookieOptions: CookieOptions = {}, storageUtil?: StorageUtil) {
    if (!storageUtil) {
      storageUtil = mockStorageUtil();
    }
    const OAuthStorageManager = createOAuthStorageManager();
    return new OAuthStorageManager(options, cookieOptions, storageUtil);
  }

  describe('getOptionsForSection', () => {
      it('unknown section returns an empty object', () => {
        const storageManager = setup();
        const options = storageManager.getOptionsForSection('unknown');
        expect(options).toEqual({});
      });
      it('named section returns config', () => {
        const config: StorageOptions = {
          storageType: 'memory'
        };
        const storageManager = setup({
          mySection: config
        });
        const options = storageManager.getOptionsForSection('mySection');
        expect(options).toEqual(config);
      });

      it('passed options override storageManager config', () => {
        const config: StorageOptions = {
          storageType: 'memory',
          storageKey: 'foo'
        };
        const storageManager = setup({
          mySection: config
        });
        const options = storageManager.getOptionsForSection('mySection', {
          sameSite: 'lax',
          storageType: 'cookie'
        });
        expect(options.storageKey).toBe('foo'); // storageManager
        expect(options.storageType).toBe('cookie'); // passed
        expect(options.sameSite).toBe('lax'); // passed
      });
  });

  describe('getStorage', () => {

    it('includes cookie config', () => {
      const storageManager = setup({}, {
        secure: false
      });
      jest.spyOn(storageManager.storageUtil, 'getStorageByType');
      storageManager.getStorage({
        storageType: 'memory'
      });
      expect(storageManager.storageUtil.getStorageByType).toHaveBeenCalledWith('memory', {
        secure: false,
        storageType: 'memory'
      });
    });

    it('passed config overrides cookie config', () => {
      const options: StorageOptions = {
        storageType: 'memory',
        secure: false
      };
      const storageManager = setup({}, {
        secure: true,
        sameSite: 'none'
      });
      jest.spyOn(storageManager.storageUtil, 'getStorageByType');
      storageManager.getStorage(options);
      expect(storageManager.storageUtil.getStorageByType).toHaveBeenCalledWith('memory', {
        storageType: 'memory',
        sameSite: 'none',  // from cookie config
        secure: false // overridden by storage manager config
      });
    });

    it('if "storageProvider" option is set, it is returned', () => {
      const storageManager = setup();
      const mockProvider = {} as unknown as StorageProvider;
      const res = storageManager.getStorage({
        storageProvider: mockProvider
      });
      expect(res).toBe(mockProvider);
    });

    describe('no "storageType"', () => {

      describe('and no "storageTypes"', () => {
        it('will not throw an error', () => {
          const storageManager = setup();
          const res = storageManager.getStorage({});
          expect(storageManager.storageUtil.getStorageByType).toHaveBeenCalledWith('mock', {});
          expect(res).toBe(mockStorage);
        });
      });

      describe('but have "storageTypes"', () => {
        it('will use the first in the list, if available', () => {
          const storageManager = setup();
          const storageTypes: StorageType[] = ['cookie', 'localStorage'];
          (storageManager.storageUtil.findStorageType as jest.Mock).mockReturnValue('cookie');
          const options = { storageTypes };
          const res = storageManager.getStorage(options);
          expect(storageManager.storageUtil.findStorageType).toHaveBeenCalledWith(storageTypes);
          expect(storageManager.storageUtil.getStorageByType).toHaveBeenCalledWith('cookie', options);
          expect(res).toBe(mockStorage);
        });

        it('will fallback to subsequent "storageTypes"', () => {
          const storageManager = setup();
          const storageTypes: StorageType[] = ['cookie', 'localStorage'];
          (storageManager.storageUtil.findStorageType as jest.Mock).mockReturnValue('localStorage');
          const options = { storageTypes };
          const res = storageManager.getStorage(options);
          expect(storageManager.storageUtil.findStorageType).toHaveBeenCalledWith(storageTypes);
          expect(storageManager.storageUtil.getStorageByType).toHaveBeenCalledWith('localStorage', options);
          expect(res).toBe(mockStorage);
        });
      });
    });

    describe('with "storageType"', () => {
      describe('but no "storageTypes"', () => {
        it('it will be used with no fallback', () => {
          const storageManager = setup();
          const storageType: StorageType = 'localStorage';
          const options = { storageType };
          const res = storageManager.getStorage(options);
          expect(storageManager.storageUtil.findStorageType).not.toHaveBeenCalled();
          expect(storageManager.storageUtil.getStorageByType).toHaveBeenCalledWith('localStorage', options);
          expect(res).toBe(mockStorage);
        });
      });
      describe('and "storageTypes"', () => {
        it('if "storageType" matches an entry in "storageTypes", it will use subsequent types as a fallback', () => {
          const storageManager = setup();
          const storageTypes: StorageType[] = ['cookie', 'localStorage', 'sessionStorage'];
          (storageManager.storageUtil.findStorageType as jest.Mock).mockReturnValue('sessionStorage');
          const storageType: StorageType = 'localStorage';
          const options = { storageType, storageTypes };
          const res = storageManager.getStorage(options);
          expect(storageManager.storageUtil.findStorageType).toHaveBeenCalledWith(['localStorage', 'sessionStorage']);
          expect(storageManager.storageUtil.getStorageByType).toHaveBeenCalledWith('sessionStorage', options);
          expect(res).toBe(mockStorage);
        });
        it('if "storageType" does not match an entry in "storageTypes" it will be used with no fallback', () => {
          const storageManager = setup();
          const storageTypes: StorageType[] = ['cookie', 'localStorage', 'sessionStorage'];
          (storageManager.storageUtil.findStorageType as jest.Mock).mockReturnValue('sessionStorage');
          const storageType: StorageType = 'memory';
          const options = { storageType, storageTypes };
          const res = storageManager.getStorage(options);
          expect(storageManager.storageUtil.findStorageType).not.toHaveBeenCalled();
          expect(storageManager.storageUtil.getStorageByType).toHaveBeenCalledWith('memory', options);
          expect(res).toBe(mockStorage);
        });
      });
    });
  }); 


  describe('getTransactionStorage', () => {

    it('options are loaded from the "transaction" section of the storageManager config', () => {
      const storageProvider = {} as unknown as StorageProvider;
      const options: StorageManagerOptions = {
        transaction: {
          storageProvider,
          storageKey: 'foo'
        }
      };
      const storageManager = setup(options);
      const res: TransactionStorage = storageManager.getTransactionStorage();
      expect((res as SavedObject).storageProvider).toBe(storageProvider);
      expect((res as SavedObject).storageName).toBe('foo');
    });

    it('options can be passed directly', () => {
      const storageProvider = {} as unknown as StorageProvider;
      const options: StorageOptions = {
        storageProvider,
        storageKey: 'foo'
      };
      const storageManager = setup();
      const res: TransactionStorage = storageManager.getTransactionStorage(options);
      expect((res as SavedObject).storageProvider).toBe(storageProvider);
      expect((res as SavedObject).storageName).toBe('foo');

    });

    it('default storageKey is "okta-transaction-storage"', () => {
      const storageManager = setup();
      const res: TransactionStorage = storageManager.getTransactionStorage();
      expect((res as SavedObject).storageName).toBe('okta-transaction-storage');
    });

    it('can set a storageKey', () => {
      const storageManager = setup();
      const res: TransactionStorage = storageManager.getTransactionStorage({
        storageKey: 'foo'
      });
      expect((res as SavedObject).storageName).toBe('foo');
    });

    it('logs warning on server side when neither custom storageKey nor storageProvider is provided', () => {
      jest.spyOn(mocked.features, 'isBrowser').mockReturnValue(false);
      jest.spyOn(mocked.util, 'warn');
      const storageManager = setup();
      storageManager.getTransactionStorage();
      expect(mocked.util.warn).toHaveBeenCalledWith('Memory storage can only support simple single user use case on server side, please provide custom storageProvider or storageKey if advanced scenarios need to be supported.');

      // Should not log warning if storageKey is provided
      mocked.util.warn.mockClear();
      storageManager.getTransactionStorage({
        storageKey: 'foo'
      });
      expect(mocked.util.warn).not.toHaveBeenCalled();

      // Should not log warning if storageProvider is provided
      mocked.util.warn.mockClear();
      const storageProvider = {} as unknown as StorageProvider;
      storageManager.getTransactionStorage({
        storageProvider
      });
      expect(mocked.util.warn).not.toHaveBeenCalled();
    });

  }); 

  describe('getTokenStorage', () => {
    it('options are loaded from the "token" section of the storageManager config', () => {
      const storageProvider = {} as unknown as StorageProvider;
      const options: StorageManagerOptions = {
        token: {
          storageProvider,
          storageKey: 'foo'
        }
      };
      const storageManager = setup(options);
      const res: TransactionStorage = storageManager.getTokenStorage();
      expect((res as SavedObject).storageProvider).toBe(storageProvider);
      expect((res as SavedObject).storageName).toBe('foo');
    });
    
    it('default storageKey is "okta-token-storage"', () => {
      const storageManager = setup();
      const res: TransactionStorage = storageManager.getTokenStorage();
      expect((res as SavedObject).storageName).toBe('okta-token-storage');
    });

    it('can set a storageKey', () => {
      const storageManager = setup();
      const res: TransactionStorage = storageManager.getTokenStorage({
        storageKey: 'foo'
      });
      expect((res as SavedObject).storageName).toBe('foo');
    });

    it('logs warning on server side when neither custom storageKey nor storageProvider is provided', () => {
      jest.spyOn(mocked.features, 'isBrowser').mockReturnValue(false);
      jest.spyOn(mocked.util, 'warn');
      const storageManager = setup();
      storageManager.getTransactionStorage();
      expect(mocked.util.warn).toHaveBeenCalledWith('Memory storage can only support simple single user use case on server side, please provide custom storageProvider or storageKey if advanced scenarios need to be supported.');

      // Should not log warning if storageKey is provided
      mocked.util.warn.mockClear();
      storageManager.getTransactionStorage({
        storageKey: 'foo'
      });
      expect(mocked.util.warn).not.toHaveBeenCalled();

      // Should not log warning if storageProvider is provided
      mocked.util.warn.mockClear();
      const storageProvider = {} as unknown as StorageProvider;
      storageManager.getTransactionStorage({
        storageProvider
      });
      expect(mocked.util.warn).not.toHaveBeenCalled();
    });
  }); 

  describe('getHttpCache', () => {
    it('options are loaded from the "cache" section of the storageManager config', () => {
      const storageProvider = {} as unknown as StorageProvider;
      const options: StorageManagerOptions = {
        cache: {
          storageProvider,
          storageKey: 'foo'
        }
      };
      const storageManager = setup(options);
      const res: TransactionStorage = storageManager.getHttpCache();
      expect((res as SavedObject).storageProvider).toBe(storageProvider);
      expect((res as SavedObject).storageName).toBe('foo');
    });
    
    it('default storageKey is "okta-cache-storage"', () => {
      const storageManager = setup();
      const res: TransactionStorage = storageManager.getHttpCache();
      expect((res as SavedObject).storageName).toBe('okta-cache-storage');
    });

    it('can set a storageKey', () => {
      const storageManager = setup();
      const res: TransactionStorage = storageManager.getHttpCache({
        storageKey: 'foo'
      });
      expect((res as SavedObject).storageName).toBe('foo');
    });
  }); 

});
