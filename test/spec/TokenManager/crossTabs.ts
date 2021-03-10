/* eslint-disable max-statements */
/* global window, localStorage, StorageEvent */

import { TokenManager } from '../../../lib/TokenManager';
import * as features from '../../../lib/features';

const Emitter = require('tiny-emitter');

describe('cross tabs communication', () => {
  let sdkMock;
  beforeEach(function() {
    jest.useFakeTimers();
    const emitter = new Emitter();
    sdkMock = {
      options: {},
      storageManager: {
        getTokenStorage: jest.fn()
      },
      emitter
    };
    jest.spyOn(features, 'isIE11OrLess').mockReturnValue(false);
    jest.spyOn(features, 'isLocalhost').mockReturnValue(true);
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('should emit events and reset timeouts when storage event happen with token storage key', () => {
    const instance = new TokenManager(sdkMock);
    instance._resetExpireEventTimeoutAll = jest.fn();
    instance._emitEventsForCrossTabsStorageUpdate = jest.fn();
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'okta-token-storage', 
      newValue: 'fake_new_value',
      oldValue: 'fake_old_value'
    }));
    jest.runAllTimers();
    expect(instance._resetExpireEventTimeoutAll).toHaveBeenCalled();
    expect(instance._emitEventsForCrossTabsStorageUpdate).toHaveBeenCalledWith('fake_new_value', 'fake_old_value');
  });
  it('should set options._storageEventDelay default to 1000 in isIE11OrLess env', () => {
    jest.spyOn(features, 'isIE11OrLess').mockReturnValue(true);
    const instance = new TokenManager(sdkMock);
    expect(instance._getOptions()._storageEventDelay).toBe(1000);
  });
  it('should use options._storageEventDelay from passed options', () => {
    const instance = new TokenManager(sdkMock, { _storageEventDelay: 100 });
    expect(instance._getOptions()._storageEventDelay).toBe(100);
  });
  it('should use options._storageEventDelay from passed options in isIE11OrLess env', () => {
    jest.spyOn(features, 'isIE11OrLess').mockReturnValue(true);
    const instance = new TokenManager(sdkMock, { _storageEventDelay: 100 });
    expect(instance._getOptions()._storageEventDelay).toBe(100);
  });
  it('should handle storage change based on _storageEventDelay option', () => {
    jest.spyOn(window, 'setTimeout');
    const instance = new TokenManager(sdkMock, { _storageEventDelay: 500 });
    instance._resetExpireEventTimeoutAll = jest.fn();
    instance._emitEventsForCrossTabsStorageUpdate = jest.fn();
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'okta-token-storage', 
      newValue: 'fake_new_value',
      oldValue: 'fake_old_value'
    }));
    expect(window.setTimeout).toHaveBeenCalledWith(expect.any(Function), 500);
    jest.runAllTimers();
    expect(instance._resetExpireEventTimeoutAll).toHaveBeenCalled();
    expect(instance._emitEventsForCrossTabsStorageUpdate).toHaveBeenCalledWith('fake_new_value', 'fake_old_value');
  });
  it('should emit events and reset timeouts when localStorage.clear() has been called from other tabs', () => {
    const instance = new TokenManager(sdkMock);
    instance._resetExpireEventTimeoutAll = jest.fn();
    instance._emitEventsForCrossTabsStorageUpdate = jest.fn();
    // simulate localStorage.clear()
    window.dispatchEvent(new StorageEvent('storage', {
      key: null,
      newValue: null,
      oldValue: null
    }));
    jest.runAllTimers();
    expect(instance._resetExpireEventTimeoutAll).toHaveBeenCalled();
    expect(instance._emitEventsForCrossTabsStorageUpdate).toHaveBeenCalledWith(null, null);
  });
  it('should not call localStorage.setItem when token storage changed', () => {
    new TokenManager(sdkMock); // eslint-disable-line no-new
    // https://github.com/facebook/jest/issues/6798#issuecomment-440988627
    jest.spyOn(window.localStorage.__proto__, 'setItem');
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'okta-token-storage', 
      newValue: 'fake_new_value',
      oldValue: 'fake_old_value'
    }));
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
  it('should not emit events or reset timeouts if the key is not token storage key', () => {
    const instance = new TokenManager(sdkMock);
    instance._resetExpireEventTimeoutAll = jest.fn();
    instance._emitEventsForCrossTabsStorageUpdate = jest.fn();
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'fake-key', 
      newValue: 'fake_new_value',
      oldValue: 'fake_old_value'
    }));
    expect(instance._resetExpireEventTimeoutAll).not.toHaveBeenCalled();
    expect(instance._emitEventsForCrossTabsStorageUpdate).not.toHaveBeenCalled();
  });
  it('should not emit events or reset timeouts if oldValue === newValue', () => {
    const instance = new TokenManager(sdkMock);
    instance._resetExpireEventTimeoutAll = jest.fn();
    instance._emitEventsForCrossTabsStorageUpdate = jest.fn();
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'okta-token-storage', 
      newValue: 'fake_unchanged_value',
      oldValue: 'fake_unchanged_value'
    }));
    expect(instance._resetExpireEventTimeoutAll).not.toHaveBeenCalled();
    expect(instance._emitEventsForCrossTabsStorageUpdate).not.toHaveBeenCalled();
  });
  
  describe('_emitEventsForCrossTabsStorageUpdate', () => {
    it('should emit "added" event if new token is added', () => {
      const instance = new TokenManager(sdkMock);
      const newValue = '{"idToken": "fake-idToken"}';
      const oldValue = null;
      jest.spyOn(sdkMock.emitter, 'emit');
      instance._emitEventsForCrossTabsStorageUpdate(newValue, oldValue);
      expect(sdkMock.emitter.emit).toHaveBeenCalledWith('added', 'idToken', 'fake-idToken');
    });
    it('should emit "added" event if token is changed', () => {
      const instance = new TokenManager(sdkMock);
      const newValue = '{"idToken": "fake-idToken"}';
      const oldValue = '{"idToken": "old-fake-idToken"}';
      jest.spyOn(sdkMock.emitter, 'emit');
      instance._emitEventsForCrossTabsStorageUpdate(newValue, oldValue);
      expect(sdkMock.emitter.emit).toHaveBeenCalledWith('added', 'idToken', 'fake-idToken');
    });
    it('should emit two "added" event if two token are added', () => {
      const instance = new TokenManager(sdkMock);
      const newValue = '{"idToken": "fake-idToken", "accessToken": "fake-accessToken"}';
      const oldValue = null;
      jest.spyOn(sdkMock.emitter, 'emit');
      instance._emitEventsForCrossTabsStorageUpdate(newValue, oldValue);
      expect(sdkMock.emitter.emit).toHaveBeenNthCalledWith(1, 'added', 'idToken', 'fake-idToken');
      expect(sdkMock.emitter.emit).toHaveBeenNthCalledWith(2, 'added', 'accessToken', 'fake-accessToken');
    });
    it('should not emit "added" event if oldToken equal to newToken', () => {
      const instance = new TokenManager(sdkMock);
      const newValue = '{"idToken": "fake-idToken"}';
      const oldValue = '{"idToken": "fake-idToken"}';
      jest.spyOn(sdkMock.emitter, 'emit');
      instance._emitEventsForCrossTabsStorageUpdate(newValue, oldValue);
      expect(sdkMock.emitter.emit).not.toHaveBeenCalled();
    });
    it('should emit "removed" event if token is removed', () => {
      const instance = new TokenManager(sdkMock);
      const newValue = null;
      const oldValue = '{"idToken": "old-fake-idToken"}';
      jest.spyOn(sdkMock.emitter, 'emit');
      instance._emitEventsForCrossTabsStorageUpdate(newValue, oldValue);
      expect(sdkMock.emitter.emit).toHaveBeenCalledWith('removed', 'idToken', 'old-fake-idToken');
    });
    it('should emit two "removed" event if two token are removed', () => {
      const instance = new TokenManager(sdkMock);
      const newValue = null;
      const oldValue = '{"idToken": "fake-idToken", "accessToken": "fake-accessToken"}';
      jest.spyOn(sdkMock.emitter, 'emit');
      instance._emitEventsForCrossTabsStorageUpdate(newValue, oldValue);
      expect(sdkMock.emitter.emit).toHaveBeenNthCalledWith(1, 'removed', 'idToken', 'fake-idToken');
      expect(sdkMock.emitter.emit).toHaveBeenNthCalledWith(2, 'removed', 'accessToken', 'fake-accessToken');
    });
  });
});