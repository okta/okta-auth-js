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
  CookieOptions,
  SavedObject,
  StorageManagerOptions, 
  StorageProvider, 
  StorageUtil
} from '../../../lib/storage';
import { createIdxStorageManager, IdxResponseStorage } from '../../../lib/idx';

jest.mock('../../../lib/util', () => {
  return {
    warn: () => {}
  };
});

jest.mock('../../../lib/features', () => {
  return {
    isBrowser: () => {},
  };
});

const mocked = {
  util: require('../../../lib/util'),
  features: require('../../../lib/features')
};

describe('IdxStorageManager', () => {

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
    const IdxStorageManager = createIdxStorageManager();
    return new IdxStorageManager(options, cookieOptions, storageUtil);
  }

  describe('getIdxResponseStorage', () => {
    describe('browser', () => {
      beforeEach(() => {
        jest.spyOn(mocked.features, 'isBrowser').mockReturnValue(true);
      });

      it('always use memory storage on browser side', () => {
        const storageManager = setup();
        const options = {};
        const res: IdxResponseStorage = storageManager.getIdxResponseStorage(options)!;
        expect(storageManager.storageUtil.getStorageByType).toHaveBeenCalledWith('memory', options);
        expect((res as SavedObject).storageName).toBe('okta-idx-response-storage');
      });

      it('logs warning if memory storage is not available', () => {
        jest.spyOn(mocked.util, 'warn');
        const storageUtil = {
          getStorageByType: jest.fn().mockImplementation(() => { 
            throw new Error('error'); 
          })
        } as unknown as StorageUtil;
        const storageManager = setup({}, {}, storageUtil);
        storageManager.getIdxResponseStorage();
        expect(mocked.util.warn).toHaveBeenCalledWith('No response storage found, you may want to provide custom implementation for intermediate idx responses to optimize the network traffic');
      });

    });

    describe('server', () => {
      beforeEach(() => {
        jest.spyOn(mocked.features, 'isBrowser').mockReturnValue(false);
      });

      it('returns custom storage based on transaction storage', () => {
        const storageProvider = {} as unknown as StorageProvider;
        const options: StorageManagerOptions = {
          transaction: {
            storageProvider
          }
        };
        const storageManager = setup(options);
        const res: IdxResponseStorage = storageManager.getIdxResponseStorage()!;
        expect(typeof (res as SavedObject).storageProvider.getItem).toBe('function');
        expect(typeof (res as SavedObject).storageProvider.setItem).toBe('function');
        expect(typeof (res as SavedObject).storageProvider.removeItem).toBe('function');
        expect((res as SavedObject).storageName).toBe('okta-idx-response-storage');
      });

      it('returns null if transaction storage is not available', () => {
        const options: StorageManagerOptions = {};
        const storageManager = setup(options);
        storageManager.getTransactionStorage = jest.fn().mockReturnValue(null);
        const res: IdxResponseStorage = storageManager.getIdxResponseStorage()!;
        expect(res).toBeNull();
      });
    });
  });


});
