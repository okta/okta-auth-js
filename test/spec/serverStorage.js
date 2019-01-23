var serverStorage = require('../../lib/server/serverStorage').storage;

describe('serverStorage', function () {
  describe('get', function () {
    it('correctly returns value from storage if key is found', function () {
      serverStorage.set('testKey', 'testValue');
      expect(serverStorage.get('testKey')).toBe('testValue');
    });

    it('correctly returns undefined if key is not found in storage', function () {
      serverStorage.set('testKey', 'testValue');
      expect(serverStorage.get('unstoredKey')).toBe(undefined);
    });

    it('correctly returns undefined if key value pair in storage is expired', function () {
      serverStorage.set('testKey', 'testValue', '2015-08-21T19:54:48.486Z');
      expect(serverStorage.get('testKey')).toBe(undefined);
    });

  });

  describe('set', function () {
    it('correctly sets a new key value pair in storage', function () {
      serverStorage.set('newKey', 'newValue');
      expect(serverStorage.get('newKey')).toBe('newValue');
    });

    it('correctly overrides the value of an existing key in storage', function () {
      serverStorage.set('testKey', 'oldValue');
      expect(serverStorage.get('testKey')).toBe('oldValue');
      serverStorage.set('testKey', 'newValue');
      expect(serverStorage.get('testKey')).toBe('newValue');
    });
  });

  describe('delete', function () {
    it('correctly deletes a key value pair from storage if the key is found', function () {
      serverStorage.set('testKey', 'testValue');
      expect(serverStorage.get('testKey')).toBe('testValue');
      expect(serverStorage.delete('testKey')).toBe(1);
      expect(serverStorage.get('testKey')).toBe(undefined);
    });

    it('does not delete anything if the key is not found in storage', function () {
      serverStorage.set('testKey', 'testValue');
      expect(serverStorage.delete('unstoredKey')).toBe(0);
    });
  });
});
