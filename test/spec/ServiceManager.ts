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
    start() { this.started = true; }
    stop() { this.started = false; }
    isLeader() { return this._isLeader; }
    _setLeader() { this._isLeader = true; }
    public onLeader() {
      (this.options as any).onLeader?.();
    }
  }
  return {
    LeaderElectionService: FakeLeaderElectionService,
  };
});


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

  describe('syncStorage', () => {
    it('allows syncStorage for storage type "cookie"', () => {
      const options = { tokenManager: { syncStorage: true, storage: 'cookie' } };
      util.disableLeaderElection();
      const client = createAuth(options);
      client.serviceManager.start();
      expect(client.serviceManager.getService('syncStorage')?.isStarted()).toBeTruthy();
      client.serviceManager.stop();
    });
  
    it('allows syncStorage for storage type "localStorage"', () => {
      const options = { tokenManager: { syncStorage: true, storage: 'localStorage' } };
      util.disableLeaderElection();
      const client = createAuth(options);
      client.serviceManager.start();
      expect(client.serviceManager.getService('syncStorage')?.isStarted()).toBeTruthy();
      client.serviceManager.stop();
    });
  
    it('NOT allows syncStorage for storage type "sessionStorage"', () => {
      const options = { tokenManager: { syncStorage: true, storage: 'sessionStorage' } };
      util.disableLeaderElection();
      const client = createAuth(options);
      client.serviceManager.start();
      expect(client.serviceManager.getService('syncStorage')?.isStarted()).toBeFalsy();
      client.serviceManager.stop();
    });
  
    it('NOT allows syncStorage for storage type "memory"', () => {
      const options = { tokenManager: { syncStorage: true, storage: 'memory' } };
      util.disableLeaderElection();
      const client = createAuth(options);
      client.serviceManager.start();
      expect(client.serviceManager.getService('syncStorage')?.isStarted()).toBeFalsy();
      client.serviceManager.stop();
    });
  });

  describe('leaderElection', () => {
    it('doesn\'t start leaderElection service if other services don\'t require leadership', () => {
      const options = { tokenManager: { syncStorage: false, autoRenew: true } };
      const client = createAuth(options);
      client.serviceManager.start();
      expect(client.serviceManager.isLeaderRequired()).toBeFalsy();
      expect(client.serviceManager.getService('leaderElection')?.isStarted()).toBeFalsy();
      client.serviceManager.stop();
    });
  
    it('starts leaderElection service if any service (autoRenew) requires leadership', () => {
      const options = { tokenManager: { syncStorage: true, autoRenew: true } };
      const client = createAuth(options);
      client.serviceManager.start();
      expect(client.serviceManager.isLeaderRequired()).toBeTruthy();
      expect(client.serviceManager.getService('leaderElection')?.isStarted()).toBeTruthy();
      client.serviceManager.stop();
    });
  });

  describe('autoRenew', () => {
    it('starts syncStorage service for every tab, autoRenew service for leader tab (for syncStorage == true)', () => {
      const options = { tokenManager: { syncStorage: true, autoRenew: true } };
      const client1 = createAuth(options);
      const client2 = createAuth(options);
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
      const client1 = createAuth(options);
      const client2 = createAuth(options);
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
      const client1 = createAuth(options);
      const client2 = createAuth(options);
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
      const options = { tokenManager: { syncStorage: true, autoRenew: true } };
      const client = createAuth(options);
      client.serviceManager.start();
      expect(client.serviceManager.isLeader()).toBeFalsy();
      expect(client.serviceManager.getService('autoRenew')?.isStarted()).toBeFalsy();
      expect(client.serviceManager.getService('syncStorage')?.isStarted()).toBeTruthy();
      expect(client.serviceManager.getService('leaderElection')?.isStarted()).toBeTruthy();
      (client.serviceManager.getService('leaderElection') as any)?._setLeader();
      (client.serviceManager.getService('leaderElection') as any)?.onLeader();
      expect(client.serviceManager.isLeader()).toBeTruthy();
      expect(client.serviceManager.getService('autoRenew')?.isStarted()).toBeTruthy();
      client.serviceManager.stop();
    });
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
  });

});
