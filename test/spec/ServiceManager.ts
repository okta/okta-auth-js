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


import { OktaAuth } from '@okta/okta-auth-js';
import util from '@okta/test.support/util';

jest.mock('broadcast-channel', () => {
  const actual = jest.requireActual('broadcast-channel');
  class FakeBroadcastChannel {}
  return {
    createLeaderElection: actual.createLeaderElection,
    BroadcastChannel: FakeBroadcastChannel
  };
});

const mocked = {
  broadcastChannel: require('broadcast-channel'),
};

function createAuth(options) {
  options = options || {};
  options.tokenManager = options.tokenManager || {};
  return new OktaAuth({
    issuer: 'https://auth-js-test.okta.com',
    clientId: 'NPSfOkH5eZrTy8PMDlvx',
    redirectUri: 'https://example.com/redirect',
    tokenManager: {
      syncStorage: options.tokenManager.syncStorage || false,
      autoRenew: options.tokenManager.autoRenew || false,
      autoRemove: options.tokenManager.autoRemove || false,
    }
  });
}

describe('ServiceManager', () => {
  beforeEach(function() {
    jest.useFakeTimers();
  });
  afterEach(function() {
    jest.useRealTimers();
  });

  it('starts syncStorage service for every tab, autoRenew service for leader tab (for syncStorage == true)', () => {
    const options = { tokenManager: { syncStorage: true, autoRenew: true } };
    let client1 = createAuth(options);
    let client2 = createAuth(options);
    util.disableLeaderElection();
    jest.spyOn(client1.serviceManager, 'isLeader').mockReturnValue(true);
    jest.spyOn(client2.serviceManager, 'isLeader').mockReturnValue(false);
    client1.serviceManager.start();
    client2.serviceManager.start();
    expect(client1.serviceManager.getService('autoRenew')?.isStarted()).toBeTruthy();
    expect(client2.serviceManager.getService('autoRenew')?.isStarted()).toBeFalsy();
    expect(client1.serviceManager.getService('syncStorage')?.isStarted()).toBeTruthy();
    expect(client2.serviceManager.getService('syncStorage')?.isStarted()).toBeTruthy();
    client1.serviceManager.stop();
    client2.serviceManager.stop();
  });

  it('starts autoRenew service for every tab (for syncStorage == false)', () => {
    const options = { tokenManager: { syncStorage: false, autoRenew: true } };
    let client1 = createAuth(options);
    let client2 = createAuth(options);
    util.disableLeaderElection();
    jest.spyOn(client1.serviceManager, 'isLeader').mockReturnValue(true);
    jest.spyOn(client2.serviceManager, 'isLeader').mockReturnValue(false);
    client1.serviceManager.start();
    client2.serviceManager.start();
    expect(client1.serviceManager.getService('autoRenew')?.isStarted()).toBeTruthy();
    expect(client2.serviceManager.getService('autoRenew')?.isStarted()).toBeTruthy();
    expect(client1.serviceManager.getService('syncStorage')?.isStarted()).toBeFalsy();
    expect(client2.serviceManager.getService('syncStorage')?.isStarted()).toBeFalsy();
    client1.serviceManager.stop();
    client2.serviceManager.stop();
  });

  it('starts no services for syncStorage == false and autoRenew == false', () => {
    const options = { tokenManager: { syncStorage: false, autoRenew: false } };
    let client1 = createAuth(options);
    let client2 = createAuth(options);
    util.disableLeaderElection();
    jest.spyOn(client1.serviceManager, 'isLeader').mockReturnValue(true);
    jest.spyOn(client2.serviceManager, 'isLeader').mockReturnValue(false);
    client1.serviceManager.start();
    client2.serviceManager.start();
    expect(client1.serviceManager.getService('autoRenew')?.isStarted()).toBeFalsy();
    expect(client2.serviceManager.getService('autoRenew')?.isStarted()).toBeFalsy();
    expect(client1.serviceManager.getService('syncStorage')?.isStarted()).toBeFalsy();
    expect(client2.serviceManager.getService('syncStorage')?.isStarted()).toBeFalsy();
    client1.serviceManager.stop();
    client2.serviceManager.stop();
  });

  it('starts autoRenew service after becoming leader (for syncStorage == true)', async () => {
    // Become leader in 100ms
    const mockedElector = {
      isLeader: false,
      awaitLeadership: () => new Promise(resolve => {
        setTimeout(() => {
          mockedElector.isLeader = true;
          resolve();
        }, 100);
      }) as Promise<void>,
      die: () => {},
    };

    const options = { tokenManager: { syncStorage: true, autoRenew: true } };
    let client = createAuth(options);
    jest.spyOn(mocked.broadcastChannel, 'createLeaderElection').mockReturnValue(mockedElector);
    client.serviceManager.start();
    expect(client.serviceManager.getService('autoRenew')?.isStarted()).toBeFalsy();
    expect(client.serviceManager.getService('syncStorage')?.isStarted()).toBeTruthy();
    jest.runAllTimers();
    await Promise.resolve();
    expect(client.serviceManager.getService('autoRenew')?.isStarted()).toBeTruthy();
    client.serviceManager.stop();
  });

  describe('Backwards Compatibility', () => {
    it('will respect `tokenManager` and `services` configurations', async () => {
      const options = {
        tokenManager: { autoRenew: true },
        services: { autoRenew: false }
      };
      const client = createAuth(options);
      expect((<any>client).options).toMatchObject({ autoRenew: false });
    });
  });

});
