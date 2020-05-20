/// <reference path="./options.d.ts" />

declare namespace OktaAuth {
  interface StorageProvider {
    setStorage(obj: any): void;
    getStorage(): any;
    clearStorage(key?: string): void;
    updateStorage(key: string, value: any): void;
  }

  interface PKCEMeta {
    codeVerifier: string;
    redirectUri: string;
  }

  interface PKCEStorage extends StorageProvider {
    setStorage(obj: PKCEMeta): void;
    getStorage(): PKCEMeta;
  }

  interface SetCookieCoptions extends CookieOptions {
    path?: string;
  }

  interface Cookies {
    set(name: string, value: string, expiresAt: string, options: SetCookieCoptions): string;
    get(name: string): string;
    delete(name: string): string;
  }

  interface StorageUtil {
    browserHasLocalStorage(): boolean;
    browserHasSessionStorage(): boolean;
    getLocalStorage(): Storage;
    getSessionStorage(): Storage;
    getInMemoryStorage(): SimpleStorage;
    getHttpCache(options?: CookieOptions): StorageProvider;
    getCookieStorage(options?: CookieOptions): SimpleStorage;
    getPKCEStorage(options?: CookieOptions): PKCEStorage;
    testStorage(storage: any): boolean;
    storage: Cookies;
  }

  interface SimpleStorage {
    getItem(key: string): any;
    setItem(key: string, value: any): void;
  }

  type StorageBuilder = (storage: Storage | SimpleStorage, name: string) => StorageProvider;
}