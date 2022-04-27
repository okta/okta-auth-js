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

  it('starts syncStorage service for every tab, autoRenew service for leader tab (for syncStorage == true)', async () => {
    const options = { tokenManager: { syncStorage: true, autoRenew: true } };
    let client1 = createAuth(options);
    let client2 = createAuth(options);
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
    let client1 = createAuth(options);
    let client2 = createAuth(options);
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
    let client1 = createAuth(options);
    let client2 = createAuth(options);
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

  it('starts autoRenew service after becoming leader (for syncStorage == true)', async () => {
    const options = { tokenManager: { syncStorage: true, autoRenew: true } };
    let client = createAuth(options);
    client.serviceManager.start();
    expect(client.serviceManager.isLeader()).toBeFalsy();
    expect(client.serviceManager.getService('autoRenew')?.isStarted()).toBeFalsy();
    expect(client.serviceManager.getService('syncStorage')?.isStarted()).toBeTruthy();
    expect(client.serviceManager.getService('leaderElection')?.isStarted()).toBeTruthy();
    (client.serviceManager.getService('leaderElection') as any)?._setLeader();
    (client.serviceManager.getService('leaderElection') as any)?.onLeader();
    expect(client.serviceManager.isLeader()).toBeTruthy();
    expect(client.serviceManager.getService('autoRenew')?.isStarted()).toBeTruthy();
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
