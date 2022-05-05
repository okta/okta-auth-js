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


/* eslint-disable max-statements */

import tokens from '@okta/test.support/tokens';
import { TokenManager } from '../../../lib/TokenManager';
import { SyncStorageService } from '../../../lib/services/SyncStorageService';
import * as features from '../../../lib/features';
import { BroadcastChannel } from 'broadcast-channel';

const Emitter = require('tiny-emitter');

describe('SyncStorageService', () => {
  let sdkMock;
  let tokenManager;
  let channel;
  let service;
  let storage;
  let tokenStorage;
  beforeEach(function() {
    tokenManager = null;
    channel = null;
    service = null;
    const emitter = new Emitter();
    storage = {
      idToken: tokens.standardIdTokenParsed
    };
    tokenStorage = {
      getStorage: jest.fn().mockImplementation(() => storage),
      setStorage: jest.fn().mockImplementation((newStorage) => {
        storage = newStorage;
      })
    };
    sdkMock = {
      options: {},
      storageManager: {
        getTokenStorage: jest.fn().mockReturnValue(tokenStorage),
        getOptionsForSection: jest.fn().mockReturnValue({})
      },
      emitter
    };
    jest.spyOn(features, 'isLocalhost').mockReturnValue(true);
  });
  afterEach(() => {
    if (tokenManager) {
      tokenManager.stop();
    }
    if (service) {
      service.stop();
    }
    if (channel) {
      channel.close();
    }
  });

  function createInstance(options?) {
    tokenManager = new TokenManager(sdkMock, options);
    tokenManager.start();
    service = new SyncStorageService(tokenManager, {
      ...tokenManager.getOptions(), 
      syncChannelName: 'syncChannel'
    });
    service.start();
    // Create another channel with same name for communication
    channel = new BroadcastChannel('syncChannel');
    return tokenManager;
  }

  describe('start', () => {
    it('stops service if already started, closes and recreates channel', async () => {
      createInstance();
      const oldChannel = (service as any).channel;
      jest.spyOn(oldChannel, 'close');
      service.start(); // restart
      const newChannel = (service as any).channel;
      expect(service.isStarted()).toBeTruthy();
      expect(oldChannel.close).toHaveBeenCalledTimes(1);
      expect(newChannel).not.toStrictEqual(oldChannel);
    });
  });

  describe('stop', () => {
    it('can be called twice without error', async () => {
      createInstance();
      const serviceChannel = (service as any).channel;
      jest.spyOn(serviceChannel, 'close');
      await Promise.race([
        service.stop(),
        service.stop()
      ]);
      expect(service.isStarted()).toBeFalsy();
      expect(serviceChannel.close).toHaveBeenCalledTimes(1);
      expect((service as any).channel).not.toBeDefined();
    });
  });

  describe('handling sync messages', () => {
    it('should emit "added" event if new token is added from another tab', async () => {
      createInstance();
      jest.spyOn(sdkMock.emitter, 'emit');
      await channel.postMessage({
        type: 'added',
        key: 'idToken',
        token: tokens.standardIdToken2Parsed
      });
      expect(sdkMock.emitter.emit).toHaveBeenCalledWith('added', 'idToken', tokens.standardIdToken2Parsed);
    });
  
    it('should emit "removed" event if token is removed from another tab', async () => {
      createInstance();
      jest.spyOn(sdkMock.emitter, 'emit');
      await channel.postMessage({
        type: 'removed',
        key: 'idToken',
        token: tokens.standardIdTokenParsed
      });
      expect(sdkMock.emitter.emit).toHaveBeenCalledWith('removed', 'idToken', tokens.standardIdTokenParsed);
    });
  
    it('should emit "renewed" event if token is chnaged from another tab', async () => {
      createInstance();
      jest.spyOn(sdkMock.emitter, 'emit');
      await channel.postMessage({
        type: 'renewed',
        key: 'idToken',
        token: tokens.standardIdToken2Parsed,
        oldToken: tokens.standardIdTokenParsed
      });
      expect(sdkMock.emitter.emit).toHaveBeenCalledWith('renewed', 'idToken', tokens.standardIdToken2Parsed, tokens.standardIdTokenParsed);
    });

    it('should not post "sync message" to other tabs', async () => {
      createInstance();
      const serviceChannel = (service as any).channel;
      jest.spyOn(serviceChannel, 'postMessage');
      await channel.postMessage({
        type: 'removed',
        key: 'idToken',
        token: tokens.standardIdTokenParsed
      });
      expect(serviceChannel.postMessage).toHaveBeenCalledTimes(0);
    });
  });

  describe('posting sync messages', () => {
    it('should post "added" sync message when new token is added', () => {
      createInstance();
      const serviceChannel = (service as any).channel;
      jest.spyOn(serviceChannel, 'postMessage');
      tokenManager.add('idToken', tokens.standardIdToken2Parsed);
      expect(serviceChannel.postMessage).toHaveBeenCalledWith({
        type: 'added',
        key: 'idToken',
        token: tokens.standardIdToken2Parsed
      });
    });

    it('should post "removed" sync message when token is removed', () => {
      createInstance();
      const serviceChannel = (service as any).channel;
      jest.spyOn(serviceChannel, 'postMessage');
      tokenManager.remove('idToken');
      expect(serviceChannel.postMessage).toHaveBeenCalledWith({
        type: 'removed',
        key: 'idToken',
        token: tokens.standardIdTokenParsed
      });
    });

    it('should post "removed", "added", "renewed" sync messages when token is changed', () => {
      createInstance();
      const serviceChannel = (service as any).channel;
      jest.spyOn(serviceChannel, 'postMessage');
      tokenManager.setTokens({
        idToken: tokens.standardIdToken2Parsed
      });
      expect(serviceChannel.postMessage).toHaveBeenNthCalledWith(1, {
        type: 'removed',
        key: 'idToken',
        token: tokens.standardIdTokenParsed
      });
      expect(serviceChannel.postMessage).toHaveBeenNthCalledWith(2, {
        type: 'added',
        key: 'idToken',
        token: tokens.standardIdToken2Parsed
      });
      expect(serviceChannel.postMessage).toHaveBeenNthCalledWith(3, {
        type: 'renewed',
        key: 'idToken',
        token: tokens.standardIdToken2Parsed,
        oldToken: tokens.standardIdTokenParsed
      });
    });

    it('should not post "set_storage" event on storage change (for non-IE)', () => {
      createInstance();
      const serviceChannel = (service as any).channel;
      jest.spyOn(serviceChannel, 'postMessage');
      tokenManager.add('idToken', tokens.standardIdTokenParsed);
      expect(serviceChannel.postMessage).toHaveBeenCalledTimes(1); // only "added"
    });
  });

  describe('IE11', () => {
    beforeEach(function() {
      jest.spyOn(features, 'isIE11OrLess').mockReturnValue(true);
    });

    it('should post "set_storage" event when new token is added', () => {
      createInstance();
      const serviceChannel = (service as any).channel;
      jest.spyOn(serviceChannel, 'postMessage');
      tokenManager.add('idToken', tokens.standardIdToken2Parsed);
      expect(serviceChannel.postMessage).toHaveBeenCalledTimes(2);
      expect(serviceChannel.postMessage).toHaveBeenNthCalledWith(1, {
        type: 'set_storage',
        storage: {
          idToken: tokens.standardIdToken2Parsed
        },
      });
      expect(serviceChannel.postMessage).toHaveBeenNthCalledWith(2, {
        type: 'added',
        key: 'idToken',
        token: tokens.standardIdToken2Parsed
      });
    });

    it('should post "set_storage" event when token is removed', () => {
      createInstance();
      const serviceChannel = (service as any).channel;
      jest.spyOn(serviceChannel, 'postMessage');
      tokenManager.remove('idToken');
      expect(serviceChannel.postMessage).toHaveBeenCalledTimes(2);
      expect(serviceChannel.postMessage).toHaveBeenNthCalledWith(1, {
        type: 'set_storage',
        storage: {
        },
      });
      expect(serviceChannel.postMessage).toHaveBeenNthCalledWith(2, {
        type: 'removed',
        key: 'idToken',
        token: tokens.standardIdTokenParsed
      });
    });

    it('should post "set_storage" event when token is chnaged', () => {
      createInstance();
      const serviceChannel = (service as any).channel;
      jest.spyOn(serviceChannel, 'postMessage');
      tokenManager.setTokens({
        idToken: tokens.standardIdToken2Parsed
      });
      expect(serviceChannel.postMessage).toHaveBeenCalledTimes(4);
      expect(serviceChannel.postMessage).toHaveBeenNthCalledWith(1, {
        type: 'set_storage',
        storage: {
          idToken: tokens.standardIdToken2Parsed
        },
      });
      expect(serviceChannel.postMessage).toHaveBeenNthCalledWith(2, {
        type: 'removed',
        key: 'idToken',
        token: tokens.standardIdTokenParsed
      });
      expect(serviceChannel.postMessage).toHaveBeenNthCalledWith(3, {
        type: 'added',
        key: 'idToken',
        token: tokens.standardIdToken2Parsed
      });
      expect(serviceChannel.postMessage).toHaveBeenNthCalledWith(4, {
        type: 'renewed',
        key: 'idToken',
        token: tokens.standardIdToken2Parsed,
        oldToken: tokens.standardIdTokenParsed
      });
    });

    it('should update storage excplicitly on "set_storage" event', async () => {
      createInstance();
      const newStorage = {
        idToken: tokens.standardIdToken2Parsed
      };
      await channel.postMessage({
        type: 'set_storage',
        storage: newStorage,
      });
      expect(storage).toEqual(newStorage);
    });
  });

});