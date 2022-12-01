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


jest.mock('../../lib/services/LeaderElectionService', () => {  
  class FakeLeaderElectionService {
    private _isLeader = false;
    private started = false;
    private options;
    constructor(options = {}) {
      this.options = options;
    }
    canStart() { return true; }
    requiresLeadership() { return false; }
    isStarted() { return this.started; }
    async start() { this.started = true; }
    async stop() { this.started = false; }
    isLeader() { return this._isLeader; }
    hasLeader() { return this._isLeader; }
    async onLeader() {
      await (this.options as any).onLeader?.();
    }
    _becomeLeaderAfterDelay(delay = 100) {
      setTimeout(() => {
        this._isLeader = true;
        this.onLeader();
      }, delay);
    }
  }
  return {
    LeaderElectionService: FakeLeaderElectionService,
  };
});

// Run pending microtasks until condition is met
async function waitFor(cond) {
  while (!cond()) {
    await Promise.resolve();
  }
}

function createAuth(options) {
  options = options || {};
  options.tokenManager = options.tokenManager || {};
  options.services = options.services || {};
  return new OktaAuth({
    issuer: 'https://auth-js-test.okta.com',
    clientId: 'NPSfOkH5eZrTy8PMDlvx',
    redirectUri: 'https://example.com/redirect',
    tokenManager: {
      syncStorage: options.tokenManager.syncStorage || false,
      autoRenew: options.tokenManager.autoRenew || false,
      autoRemove: options.tokenManager.autoRemove || false,
      ...options.tokenManager
    },
    services: options.services
  });
}

describe('ServiceManager', () => {
  beforeEach(function() {
    jest.useFakeTimers();
  });
  afterEach(function() {
    jest.useRealTimers();
  });

  describe('leaderElection', () => {
    it('doesn\'t start leaderElection service if other services don\'t require leadership', async () => {
      const options = { tokenManager: { syncStorage: false, autoRenew: true } };
      const client = createAuth(options);
      await client.serviceManager.start();
      expect(client.serviceManager.isLeaderRequired()).toBeFalsy();
      expect(client.serviceManager.getService('leaderElection')?.isStarted()).toBeFalsy();
      await client.serviceManager.stop();
    });
  
    it('starts leaderElection service if any service (autoRenew) requires leadership', async () => {
      const options = { tokenManager: { syncStorage: true, autoRenew: true } };
      const client = createAuth(options);
      expect(client.serviceManager.isLeaderRequired()).toBeTruthy();
      (client.serviceManager.getService('leaderElection') as any)._becomeLeaderAfterDelay();
      jest.runAllTimers();
      await client.serviceManager.start();
      expect(client.serviceManager.getService('leaderElection')?.isStarted()).toBeTruthy();
      await client.serviceManager.stop();
    });
  });

  describe('autoRenew', () => {
    it('starts syncStorage service for every tab, autoRenew service for leader tab (for syncStorage == true)', async () => {
      const options = { tokenManager: { syncStorage: true, autoRenew: true } };
      const client1 = createAuth(options);
      const client2 = createAuth(options);
      util.disableLeaderElection();
      jest.spyOn(client1.serviceManager, 'isLeader').mockReturnValue(true);
      jest.spyOn(client2.serviceManager, 'isLeader').mockReturnValue(false);
      await client1.serviceManager.start();
      await client2.serviceManager.start();
      expect(client1.serviceManager.getService('autoRenew')?.isStarted()).toBeTruthy();
      expect(client2.serviceManager.getService('autoRenew')?.isStarted()).toBeFalsy();
      expect(client1.serviceManager.getService('syncStorage')?.isStarted()).toBeTruthy();
      expect(client2.serviceManager.getService('syncStorage')?.isStarted()).toBeTruthy();
      await client1.serviceManager.stop();
      await client2.serviceManager.stop();
    });
  
    it('starts autoRenew service for every tab (for syncStorage == false)', async () => {
      const options = { tokenManager: { syncStorage: false, autoRenew: true } };
      const client1 = createAuth(options);
      const client2 = createAuth(options);
      util.disableLeaderElection();
      jest.spyOn(client1.serviceManager, 'isLeader').mockReturnValue(true);
      jest.spyOn(client2.serviceManager, 'isLeader').mockReturnValue(false);
      await client1.serviceManager.start();
      await client2.serviceManager.start();
      expect(client1.serviceManager.getService('autoRenew')?.isStarted()).toBeTruthy();
      expect(client2.serviceManager.getService('autoRenew')?.isStarted()).toBeTruthy();
      expect(client1.serviceManager.getService('syncStorage')?.isStarted()).toBeFalsy();
      expect(client2.serviceManager.getService('syncStorage')?.isStarted()).toBeFalsy();
      await client1.serviceManager.stop();
      await client2.serviceManager.stop();
    });
  
    it('starts no services for syncStorage == false and autoRenew == false', async () => {
      const options = { tokenManager: { syncStorage: false, autoRenew: false } };
      const client1 = createAuth(options);
      const client2 = createAuth(options);
      util.disableLeaderElection();
      jest.spyOn(client1.serviceManager, 'isLeader').mockReturnValue(true);
      jest.spyOn(client2.serviceManager, 'isLeader').mockReturnValue(false);
      await client1.serviceManager.start();
      await client2.serviceManager.start();
      expect(client1.serviceManager.getService('autoRenew')?.isStarted()).toBeFalsy();
      expect(client2.serviceManager.getService('autoRenew')?.isStarted()).toBeFalsy();
      expect(client1.serviceManager.getService('syncStorage')?.isStarted()).toBeFalsy();
      expect(client2.serviceManager.getService('syncStorage')?.isStarted()).toBeFalsy();
      await client1.serviceManager.stop();
      await client2.serviceManager.stop();
    });
  
    it('starts autoRenew service after becoming a leader (for syncStorage == true)', async () => {
      const options = { tokenManager: { syncStorage: true, autoRenew: true } };
      const client = createAuth(options);
      expect(client.serviceManager.isLeaderRequired()).toBeTruthy();
      (client.serviceManager.getService('leaderElection') as any)?._becomeLeaderAfterDelay();
      jest.runAllTimers();
      await client.serviceManager.start();
      expect(client.serviceManager.isLeader()).toBeTruthy();
      expect(client.serviceManager.getService('autoRenew')?.isStarted()).toBeTruthy();
      expect(client.serviceManager.getService('syncStorage')?.isStarted()).toBeTruthy();
      expect(client.serviceManager.getService('leaderElection')?.isStarted()).toBeTruthy();
      await client.serviceManager.stop();
    });
  });

  it('resolves start promise after becoming a leader if any service requires leadership', async () => {
    const options = { tokenManager: { syncStorage: true, autoRenew: true } };
    const client = createAuth(options);
    expect(client.serviceManager.isLeaderRequired()).toBeTruthy();
    expect(client.serviceManager.hasLeader()).toBeFalsy();

    // leader will be elected in 500ms
    (client.serviceManager.getService('leaderElection') as any)?._becomeLeaderAfterDelay(500);

    // start service manager, but don't wait to resolve
    let hasStarted = false;
    const startPromise = client.serviceManager.start();
    startPromise.then(() => {
      hasStarted = true;
    });
    
    // wait until all services are started except autoRenew (waiting for leader)
    await waitFor(() => (client.serviceManager as any).started);
    expect(client.serviceManager.isLeader()).toBeFalsy();
    expect(client.serviceManager.getService('leaderElection')?.isStarted()).toBeTruthy();
    expect(client.serviceManager.getService('autoRenew')?.isStarted()).toBeFalsy();
    
    // wait 500ms
    jest.advanceTimersByTime(500);

    // leader has been elected
    expect(client.serviceManager.isLeader()).toBeTruthy();
    // promise should be resolved
    await waitFor(() => hasStarted);
    // all services are started now
    expect(client.serviceManager.getService('autoRenew')?.isStarted()).toBeTruthy();
    expect(client.serviceManager.getService('syncStorage')?.isStarted()).toBeTruthy();
    expect(client.serviceManager.getService('leaderElection')?.isStarted()).toBeTruthy();

    await client.serviceManager.stop();
  });

  it('can restart', async () => {
    const options = {
      services: { syncStorage: true }
    };
    util.disableLeaderElection();
    const client = createAuth(options);
    await client.serviceManager.start();
    await client.serviceManager.stop();
    await client.serviceManager.start();
    expect(client.serviceManager.getService('syncStorage')?.isStarted()).toBeTruthy();
    await client.serviceManager.stop();
  });

  it('sets default channel names', () => {
    const client = createAuth({});
    const serviceManagerOptions = (client.serviceManager as any).options;
    expect(serviceManagerOptions.electionChannelName).toEqual('NPSfOkH5eZrTy8PMDlvx-election');
    expect(serviceManagerOptions.syncChannelName).toEqual('NPSfOkH5eZrTy8PMDlvx-sync');
  });

  it('can set channel name for leader election with `services.electionChannelName`', () => {
    const options = {
      services: { electionChannelName: 'test-election-channel' }
    };
    const client = createAuth(options);
    const serviceManagerOptions = (client.serviceManager as any).options;
    expect(serviceManagerOptions.electionChannelName).toEqual('test-election-channel');
  });

  it('can set channel name for sync service with `services.syncChannelName`', () => {
    const options = {
      services: { syncChannelName: 'test-sync-channel' }
    };
    const client = createAuth(options);
    const serviceManagerOptions = (client.serviceManager as any).options;
    expect(serviceManagerOptions.syncChannelName).toEqual('test-sync-channel');
  });

  // TODO: remove in next major version - OKTA-473815
  describe('Backwards Compatibility', () => {
    it('`services` will supersede `tokenManager` configurations', async () => {
      const options = {
        tokenManager: { autoRenew: true },
        services: { autoRenew: false }
      };
      const client = createAuth(options);
      util.disableLeaderElection();
      await client.serviceManager.start();
      expect(client.serviceManager.getService('autoRenew')?.isStarted()).toBeFalsy();
    });

    it('`services` supports `broadcastChannelName` as old name for `electionChannelName`', () => {
      const options = {
        services: { broadcastChannelName: 'test-channel' }
      };
      const client = createAuth(options);
      const serviceManagerOptions = (client.serviceManager as any).options;
      expect(serviceManagerOptions.electionChannelName).toEqual('test-channel');
    });
  });

});
