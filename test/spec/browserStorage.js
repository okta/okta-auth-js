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
      expect(fn).toThrowError(/Cannot read property 'secure' of undefined|Cannot read properties of undefined \(reading 'secure'\)/);
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
    
    describe('useSeparateCookies: false', () => {
      it('getItem: will call storage.get', () => {
        const retVal = { fakeCookie: true };
        jest.spyOn(browserStorage.storage, 'get').mockReturnValue(retVal);
        const storage = browserStorage.getCookieStorage({ secure: true, sameSite: 'strict' });
        const key = 'fake-key';
        expect(storage.getItem(key)).toBe(retVal);
        expect(browserStorage.storage.get).toHaveBeenCalledWith(key);
      });
  
      it('setItem: without sessionCookie set, it will call storage.set, passing secure, sameSite and infinite expiration date options', () => {
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
  
      it('setItem: when sessionCookie is set, it will call storage.set, passing secure, sameSite and session-limited expiration date(null) options ', () => {
        jest.spyOn(browserStorage.storage, 'set').mockReturnValue(null);
        const storage = browserStorage.getCookieStorage({ secure: 'fakey', sameSite: 'strictly fakey', sessionCookie: true });
        const key = 'fake-key';
        const val = { fakeValue: true };
        storage.setItem(key, val);
        expect(browserStorage.storage.set).toHaveBeenCalledWith(key, val, null, {
          secure: 'fakey',
          sameSite: 'strictly fakey'
        });
      });
    });

    describe('useSeparateCookies: true', () => {
      it('getItem: will use storage.get internally, but not directly', () => {
        const retVal = { fakeCookie: true };
        jest.spyOn(browserStorage.storage, 'get');
        const storage = browserStorage.getCookieStorage({ secure: true, sameSite: 'strict', useSeparateCookies: true });
        jest.spyOn(storage, 'getItem').mockReturnValue(retVal);
        const key = 'fake-key';
        expect(storage.getItem(key)).toBe(retVal);
        expect(storage.getItem).toHaveBeenCalledWith(key);
        expect(browserStorage.storage.get).not.toHaveBeenCalledWith(key);
      });
  
      it('setItem: will use storage.get and storage.set internally, but not directly', () => {
        jest.spyOn(browserStorage.storage, 'set');
        const storage = browserStorage.getCookieStorage({ secure: 'fakey', sameSite: 'strictly fakey' });
        jest.spyOn(storage, 'setItem').mockReturnValue(null);
        const key = 'fake-key';
        const val = { fakeValue: true };
        storage.setItem(key, val);
        expect(storage.setItem).toHaveBeenCalledWith(key, val);
        expect(browserStorage.storage.set).not.toHaveBeenCalled();
      });
    });
  });

  describe('getInMemoryStorage', () => {

    it('can set and retrieve a value from memory', () => {
      let storage = browserStorage.getInMemoryStorage();
      const key = 'fake-key';
      const val = { fakeValue: true };
      storage.setItem(key, val);
      // re-get the storage should presever the same stored value
      storage = browserStorage.getInMemoryStorage();
      expect(storage.getItem(key)).toBe(val);
    });
  });
});
