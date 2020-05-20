var storageBuilder  = require('../../lib/storageBuilder');

describe('storageBuilder', () => {

  it('throws if a storagename is not provided', () => {
    const fn = function() {
      storageBuilder(null, null);
    };
    expect(fn).toThrowError('"storageName" is required');
  });

  it('Returns an interface around a storage object', () => {
    const storage = storageBuilder({ getItem: jest.fn(), setItem: jest.fn() }, 'fake');
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
      const storage = storageBuilder(inner, storageName);
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
      const storage = storageBuilder(inner, storageName);
      expect(storage.getStorage()).toEqual(obj);
    });
    it('throws if object cannot be decoded', () => {
      const inner = {
        getItem: jest.fn().mockReturnValue('a string that wont decode'),
        setItem: jest.fn()
      };
      const storageName = 'fake';
      const storage = storageBuilder(inner, storageName);
      const fn = function() {
        storage.getStorage();
      }
      expect(fn).toThrowError('Unable to parse storage string: fake')
    });
  });

  describe('setStorage', () => {
    it('Calls "setItem" on the inner storage', () => {
      const inner = {
        getItem: jest.fn(),
        setItem: jest.fn()
      };
      const storageName = 'fake';
      const storage = storageBuilder(inner, storageName);
      storage.setStorage({});
      expect(inner.setItem).toHaveBeenCalledWith(storageName, '{}');
    });
    it('JSON stringifies the object passed to inner storage', () => {
      const inner = {
        getItem: jest.fn(),
        setItem: jest.fn()
      };
      const storageName = 'fake';
      const storage = storageBuilder(inner, storageName);
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
      const storage = storageBuilder(inner, storageName);
      const fn = function() {
        storage.setStorage({});
      }
      expect(fn).toThrowError('Unable to set storage: fake');
    });
  });

  describe('clearStorage', () => {
    it('if no key is passed, it will set storage to an empty object', () => {
      const inner = {
        getItem: jest.fn(),
        setItem: jest.fn()
      };
      const storageName = 'fake';
      const storage = storageBuilder(inner, storageName);
      storage.clearStorage();
      expect(inner.setItem).toHaveBeenCalledWith(storageName, '{}');
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
      const storage = storageBuilder(inner, storageName);
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
      const storage = storageBuilder(inner, storageName);
      storage.updateStorage('key2', 'b');
      expect(inner.getItem).toHaveBeenCalledWith(storageName);
      expect(inner.setItem).toHaveBeenCalledWith(storageName, JSON.stringify(finalObj));
    });
  });
});