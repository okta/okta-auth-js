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
import { TokenManager } from '../../../lib/oidc/TokenManager';
import { SyncStorageService } from '../../../lib/services/SyncStorageService';
import * as features from '../../../lib/features';
import { AuthSdkError } from '../../../lib/errors';
import { BroadcastChannel } from 'broadcast-channel';

const Emitter = require('tiny-emitter');

jest.mock('broadcast-channel', () => {
  const actual = jest.requireActual('broadcast-channel');
  return { ...actual };
});
const mocked = {
  broadcastChannel: require('broadcast-channel')
};

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
      }),
      clearStorage: jest.fn().mockImplementation(() => {
        storage = {};
      }),
    };
    sdkMock = {
      options: {},
      storageManager: {
        getTokenStorage: jest.fn().mockReturnValue(tokenStorage),
        getOptionsForSection: jest.fn().mockReturnValue({})
      },
      emitter
    };
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

  async function createInstance(startService = true) {
    tokenManager = new TokenManager(sdkMock);
    tokenManager.start();
    service = new SyncStorageService(tokenManager, {
      ...tokenManager.getOptions(), 
      syncChannelName: 'syncChannel'
    });
    if (startService) {
      await service.start();
    }
    // Create another channel with same name for communication
    channel = new BroadcastChannel('syncChannel');
    return tokenManager;
  }

  describe('start', () => {
    it('does not stop service if already started', async () => {
      await createInstance(false);
      await service.start();
      const channel = (service as any).channel;
      jest.spyOn(channel, 'close');
      await service.start(); // start again
      expect(service.isStarted()).toBeTruthy();
      expect((service as any).channel).toStrictEqual(channel);
      expect(channel.close).toHaveBeenCalledTimes(0);
    });

    it('throws AuthSdkError when no sync method is supported in browser', async () => {
      await createInstance(false);
      jest.spyOn(mocked.broadcastChannel, 'BroadcastChannel').mockImplementationOnce(() => {
        throw new Error('Not supported');
      });
      await expect(async () => {
        await service.start();
      }).rejects.toThrowError(new AuthSdkError('SyncStorageService is not supported in current browser.'));
    });

    it('calling start twice creates only 1 channel', async () => {
      await createInstance(false);
      const spy = jest.spyOn(BroadcastChannel.prototype, 'addEventListener');
      await Promise.all([
        service.start(),
        service.start()
      ]);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('stop', () => {
    it('should close channel', async () => {
      await createInstance();
      const channel = (service as any).channel;
      jest.spyOn(channel, 'close');
      await service.stop();
      expect(service.isStarted()).toBeFalsy();
      expect(channel.close).toHaveBeenCalledTimes(1);
    });

    it('can be called twice without error', async () => {
      await createInstance();
      await Promise.race([
        service.stop(),
        service.stop()
      ]);
      expect(service.isStarted()).toBeFalsy();
      expect((service as any).channel).not.toBeDefined();
    });
  });

  describe('handling sync messages', () => {
    it('should emit "added" event if new token is added from another tab', async () => {
      await createInstance();
      jest.spyOn(sdkMock.emitter, 'emit');
      await channel.postMessage({
        type: 'added',
        key: 'idToken',
        token: tokens.standardIdToken2Parsed
      });
      expect(sdkMock.emitter.emit).toHaveBeenCalledWith('added', 'idToken', tokens.standardIdToken2Parsed);
    });
  
    it('should emit "removed" event if token is removed from another tab', async () => {
      await createInstance();
      jest.spyOn(sdkMock.emitter, 'emit');
      await channel.postMessage({
        type: 'removed',
        key: 'idToken',
        token: tokens.standardIdTokenParsed
      });
      expect(sdkMock.emitter.emit).toHaveBeenCalledWith('removed', 'idToken', tokens.standardIdTokenParsed);
    });
  
    it('should emit "renewed" event if token is chnaged from another tab', async () => {
      await createInstance();
      jest.spyOn(sdkMock.emitter, 'emit');
      await channel.postMessage({
        type: 'renewed',
        key: 'idToken',
        token: tokens.standardIdToken2Parsed,
        oldToken: tokens.standardIdTokenParsed
      });
      expect(sdkMock.emitter.emit).toHaveBeenCalledWith('renewed', 'idToken', tokens.standardIdToken2Parsed, tokens.standardIdTokenParsed);
    });

    it('should not post sync message to other tabs', async () => {
      await createInstance();
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
    it('should post "added" sync message when new token is added', async () => {
      await createInstance();
      const serviceChannel = (service as any).channel;
      jest.spyOn(serviceChannel, 'postMessage');
      tokenManager.add('idToken', tokens.standardIdToken2Parsed);
      expect(serviceChannel.postMessage).toHaveBeenCalledWith({
        type: 'added',
        key: 'idToken',
        token: tokens.standardIdToken2Parsed
      });
    });

    it('should post "removed" sync message when token is removed', async () => {
      await createInstance();
      const serviceChannel = (service as any).channel;
      jest.spyOn(serviceChannel, 'postMessage');
      tokenManager.remove('idToken');
      expect(serviceChannel.postMessage).toHaveBeenCalledWith({
        type: 'removed',
        key: 'idToken',
        token: tokens.standardIdTokenParsed
      });
    });

    it('should post "removed", "added", "renewed" sync messages when token is changed', async () => {
      await createInstance();
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

    it('should post "remove" events when token storage is cleared', async () => {
      await createInstance();
      const serviceChannel = (service as any).channel;
      jest.spyOn(serviceChannel, 'postMessage');
      tokenManager.clear();
      expect(serviceChannel.postMessage).toHaveBeenCalledTimes(1);
      expect(serviceChannel.postMessage).toHaveBeenNthCalledWith(1, {
        type: 'removed',
        key: 'idToken',
        token: tokens.standardIdTokenParsed
      });
    });

    it('should not post "set_storage" event on storage change (for non-IE)', async () => {
      await createInstance();
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

    it('should post "set_storage" event when new token is added', async () => {
      await createInstance();
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

    it('should post "set_storage" event when token is removed', async () => {
      await createInstance();
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

    it('should post "set_storage" event when token storage is cleared', async () => {
      await createInstance();
      const serviceChannel = (service as any).channel;
      jest.spyOn(serviceChannel, 'postMessage');
      tokenManager.clear();
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

    it('should post "set_storage" event when token is chnaged', async () => {
      await createInstance();
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
      await createInstance();
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