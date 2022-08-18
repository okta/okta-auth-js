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


import { SavedObject } from '../../lib/storage/SavedObject';
import { SimpleStorage } from '../../lib/types';

describe('SavedObject', () => {

  it('throws if a storage is not provided', () => {
    const fn = function() {
      return new SavedObject(undefined as unknown as SimpleStorage, '');
    };
    expect(fn).toThrowError('"storage" is required');
  });

  it('throws if a storageName is not provided', () => {
    const fn = function() {
      const storage = {} as unknown as SimpleStorage;
      return new SavedObject(storage, '');
    };
    expect(fn).toThrowError('"storageName" is required');
  });

  it('Returns an interface around a storage object', () => {
    const storage = new SavedObject({} as unknown as SimpleStorage, 'fake');
    expect(typeof storage.getStorage).toBe('function');
    expect(typeof storage.setStorage).toBe('function');
    expect(typeof storage.clearStorage).toBe('function');
    expect(typeof storage.updateStorage).toBe('function');
  });

  describe('getStorage', () => {
    it('Calls "getItem" on the inner storage', () => {
      const inner = {
        getItem: jest.fn(),
        setItem: jest.fn()
      };
      const storageName = 'fake';
      const storage = new SavedObject(inner, storageName);
      storage.getStorage();
      expect(inner.getItem).toHaveBeenCalledWith(storageName);
    });
    it('JSON decodes the returned object', () => {
      const obj = { fakeObject: true };
      const inner = {
        getItem: jest.fn().mockReturnValue(JSON.stringify(obj)),
        setItem: jest.fn()
      };
      const storageName = 'fake';
      const storage = new SavedObject(inner, storageName);
      expect(storage.getStorage()).toEqual(obj);
    });
    it('throws if object cannot be decoded', () => {
      const inner = {
        getItem: jest.fn().mockReturnValue('a string that wont decode'),
        setItem: jest.fn()
      };
      const storageName = 'fake';
      const storage = new SavedObject(inner, storageName);
      const fn = function() {
        storage.getStorage();
      };
      expect(fn).toThrowError('Unable to parse storage string: fake');
    });
  });

  describe('setStorage', () => {
    it('Calls "setItem" on the inner storage', () => {
      const inner = {
        getItem: jest.fn(),
        setItem: jest.fn()
      };
      const storageName = 'fake';
      const storage = new SavedObject(inner, storageName);
      storage.setStorage({});
      expect(inner.setItem).toHaveBeenCalledWith(storageName, '{}');
    });
    it('JSON stringifies the object passed to inner storage', () => {
      const inner = {
        getItem: jest.fn(),
        setItem: jest.fn()
      };
      const storageName = 'fake';
      const storage = new SavedObject(inner, storageName);
      const obj = { fakeObject: true, anArray: [1, 2, 3] };
      storage.setStorage(obj);
      expect(inner.setItem).toHaveBeenCalledWith(storageName, JSON.stringify(obj));
    });
    it('Throws an error if setItem throws', () => {
      const inner = {
        getItem: jest.fn(),
        setItem: jest.fn().mockImplementation(() => {
          throw new Error('this error will be caught');
        })
      };
      const storageName = 'fake';
      const storage = new SavedObject(inner, storageName);
      const fn = function() {
        storage.setStorage({});
      };
      expect(fn).toThrowError('Unable to set storage: fake');
    });
  });

  describe('clearStorage', () => {
    describe('if no key is passed', () => {
      it('uses storageProvider.removeItem (instead of setItem) if available', () => {
        const inner = {
          getItem: jest.fn(),
          setItem: jest.fn(),
          removeItem: jest.fn()
        };
        const storageName = 'fake';
        const storage = new SavedObject(inner, storageName);
        storage.clearStorage();
        expect(inner.removeItem).toHaveBeenCalledWith(storageName);
        expect(inner.setItem).not.toHaveBeenCalled();
      });
      it('sets storage to an empty object', () => {
        const inner = {
          getItem: jest.fn(),
          setItem: jest.fn()
        };
        const storageName = 'fake';
        const storage = new SavedObject(inner, storageName);
        storage.clearStorage();
        expect(inner.setItem).toHaveBeenCalledWith(storageName, '{}');
      });
    });

    it('will remove the property with the given key', () => {
      const obj = {
        key1: 'a',
        key2: 'b'
      };
      const inner = {
        setItem: jest.fn(),
        getItem: jest.fn().mockReturnValue(JSON.stringify(obj))
      };
      const storageName = 'fake';
      const storage = new SavedObject(inner, storageName);
      storage.clearStorage('key1');
      expect(inner.getItem).toHaveBeenCalledWith(storageName);
      expect(inner.setItem).toHaveBeenCalledWith(storageName, '{"key2":"b"}');
    });
  });

  describe('updateStorage', () => {
    it('will add a property with the given key', () => {
      const initialObj = {
        key1: 'a'
      };
      const finalObj = {
        key1: 'a',
        key2: 'b'
      };
      const inner = {
        setItem: jest.fn(),
        getItem: jest.fn().mockReturnValue(JSON.stringify(initialObj))
      };
      const storageName = 'fake';
      const storage = new SavedObject(inner, storageName);
      storage.updateStorage('key2', 'b');
      expect(inner.getItem).toHaveBeenCalledWith(storageName);
      expect(inner.setItem).toHaveBeenCalledWith(storageName, JSON.stringify(finalObj));
    });
  });
});