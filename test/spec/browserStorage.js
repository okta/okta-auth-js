/* global window */

import browserStorage from '../../lib/browser/browserStorage';

describe('browserStorage', () => {
  let originalLocalStorage;
  let originalSessionStorage;
  let originalLocation;

  beforeEach(() => {
    originalLocalStorage = global.window.localStorage;
    originalSessionStorage = global.window.sessionStorage;
    originalLocation = global.window.location;
  });

  afterEach(() => {
    global.window.localStorage = originalLocalStorage;
    global.window.sessionStorage = originalSessionStorage;
    global.window.location = originalLocation;
  });

  it('can return localStorage', () => {
    expect(global.window.localStorage).toBeDefined();
    expect(browserStorage.getLocalStorage()).toBe(global.window.localStorage);
    expect(browserStorage.getLocalStorage()).not.toBe(global.window.sessionStorage);
  });

  it('can return sessionStorage', () => {
    expect(global.window.sessionStorage).toBeDefined();
    expect(browserStorage.getSessionStorage()).toBe(global.window.sessionStorage);
  });

  describe('browserHasLocalStorage', () => {

    it('returns true if storage exists and passes test', () => {
      expect(browserStorage.browserHasLocalStorage()).toBe(true);
    });

    it('returns false if localStorage does not exist', () => {
      delete global.window.localStorage;
      expect(browserStorage.browserHasLocalStorage()).toBe(false);
    });

    it('returns false if testStorage() returns false', () => {
      jest.spyOn(browserStorage, 'testStorage').mockReturnValue(false);
      expect(browserStorage.browserHasLocalStorage()).toBe(false);
    });

  });

  describe('browserHasSessionStorage', () => {

    it('returns true if storage exists and passes test', () => {
      expect(browserStorage.browserHasSessionStorage()).toBe(true);
      expect(browserStorage.getSessionStorage()).toBe(global.window.sessionStorage);
      expect(browserStorage.getSessionStorage()).not.toBe(global.window.localStorage);
    });

    it('returns false if sessionStorage does not exist', () => {
      delete window.sessionStorage;
      expect(browserStorage.browserHasSessionStorage()).toBe(false);
    });

    it('returns false if testStorage() returns false', () => {
      jest.spyOn(browserStorage, 'testStorage').mockReturnValue(false);
      expect(browserStorage.browserHasSessionStorage()).toBe(false);
    });

  });

  describe('testStorage', () => {

    it('returns true if no exception is thrown', () => {
      const fakeStorage = {
        removeItem: jest.fn(),
        setItem: jest.fn()
      };
      expect(browserStorage.testStorage(fakeStorage)).toBe(true);
      expect(fakeStorage.setItem).toHaveBeenCalledWith('okta-test-storage', 'okta-test-storage');
      expect(fakeStorage.removeItem).toHaveBeenCalledWith('okta-test-storage');
    });

    it('returns false if an exception is thrown on removeItem', () => {
      const fakeStorage = {
        removeItem: jest.fn().mockImplementation(() => {
          throw new Error('removeItem fails');
        }),
        setItem: jest.fn()
      };
      expect(browserStorage.testStorage(fakeStorage)).toBe(false);
    });

    it('returns false if an exception is thrown on setItem', () => {
      const fakeStorage = {
        removeItem: jest.fn(),
        setItem: jest.fn().mockImplementation(() => {
          throw new Error('setItem fails');
        }),
      };
      expect(browserStorage.testStorage(fakeStorage)).toBe(false);
    });

  });

  describe('getCookieStorage', () => {
    
    it('requires an options object', () => {
      const fn = function() {
        browserStorage.getCookieStorage();
      };
      expect(fn).toThrowError('Cannot read property \'secure\' of undefined');
    });

    it('requires a "secure" option', () => {
      const fn = function() {
        browserStorage.getCookieStorage({});
      };
      expect(fn).toThrowError('getCookieStorage: "secure" and "sameSite" options must be provided');
    });

    it('requires a "sameSite" option', () => {
      const fn = function() {
        browserStorage.getCookieStorage({ secure: true });
      };
      expect(fn).toThrowError('getCookieStorage: "secure" and "sameSite" options must be provided');
    });

    it('Can pass false for "secure" and "sameSite"', () => {
      const fn = function() {
        browserStorage.getCookieStorage({ secure: false, sameSite: false });
      };
      expect(fn).not.toThrow();
    });

    it('getItem: will call storage.get', () => {
      const retVal = { fakeCookie: true };
      jest.spyOn(browserStorage.storage, 'get').mockReturnValue(retVal);
      const storage = browserStorage.getCookieStorage({ secure: true, sameSite: 'strict' });
      const key = 'fake-key';
      expect(storage.getItem(key)).toBe(retVal);
      expect(browserStorage.storage.get).toHaveBeenCalledWith(key);
    });

    it('setItem: will call storage.set, passing secure and sameSite options', () => {
      jest.spyOn(browserStorage.storage, 'set').mockReturnValue(null);
      const storage = browserStorage.getCookieStorage({ secure: 'fakey', sameSite: 'strictly fakey' });
      const key = 'fake-key';
      const val = { fakeValue: true };
      storage.setItem(key, val);
      expect(browserStorage.storage.set).toHaveBeenCalledWith(key, val, '2200-01-01T00:00:00.000Z', {
        secure: 'fakey',
        sameSite: 'strictly fakey'
      });
    });
  });

  describe('getInMemoryStorage', () => {

    it('can set and retrieve a value from memory', () => {
      const storage = browserStorage.getInMemoryStorage();
      const key = 'fake-key';
      const val = { fakeValue: true };
      storage.setItem(key, val);
      expect(storage.getItem(key)).toBe(val);
    });
  });
});
