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
  let instance;
  let channel;
  let service;
  let storage;
  let tokenStorage;
  beforeEach(function() {
    instance = null;
    channel = null;
    service = null;
    const emitter = new Emitter();
    storage = {
      idToken: tokens.standardIdTokenParsed
    };
    tokenStorage = {
        getStorage: jest.fn().mockImplementation(() => storage),
        setStorage: jest.fn().mockImplementation(() => {})
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
    if (instance) {
      instance.stop();
    }
    if (service) {
      service.stop();
    }
    if (channel) {
      channel.close();
    }
  });

  function createInstance(options?) {
    instance = new TokenManager(sdkMock, options);
    instance.start();
    service = new SyncStorageService(instance, {
      ...instance.getOptions(), 
      syncChannelName: 'syncChannel'
    });
    service.start();
    channel = new BroadcastChannel('syncChannel');
    return instance;
  }

  it('should emit "added" event if new token is added', async () => {
    createInstance();
    jest.spyOn(sdkMock.emitter, 'emit');
    await channel.postMessage({
      type: 'added',
      key: 'idToken',
      token: tokens.standardIdTokenParsed
    });
    expect(sdkMock.emitter.emit).toHaveBeenCalledWith('added', 'idToken', tokens.standardIdTokenParsed);
  });

  it('should emit "renewed" event if token is changed', async () => {
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

  it('should emit "removed" event if token is removed', async () => {
    createInstance();
    jest.spyOn(sdkMock.emitter, 'emit');
    await channel.postMessage({
      type: 'removed',
      key: 'idToken',
      token: tokens.standardIdTokenParsed
    });
    expect(sdkMock.emitter.emit).toHaveBeenCalledWith('removed', 'idToken', tokens.standardIdTokenParsed);
  });

});