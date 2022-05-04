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


import { LeaderElectionService } from '../../../lib/services/LeaderElectionService';

jest.mock('broadcast-channel', () => {
  const actual = jest.requireActual('broadcast-channel');
  class FakeBroadcastChannel {
    close() {}
  }
  return {
    createLeaderElection: actual.createLeaderElection,
    BroadcastChannel: FakeBroadcastChannel
  };
});

const mocked = {
  broadcastChannel: require('broadcast-channel'),
};

describe('LeaderElectionService', () => {
  let service;
  beforeEach(function() {
    jest.useFakeTimers();
    service = null;
  });
  afterEach(() => {
    jest.useRealTimers();
    if (service) {
      service.stop();
    }
  });

  function createService(options?) {
    service = new LeaderElectionService({
      ...options,
      electionChannelName: 'electionChannel'
    });
    return service;
  }

  function createElectorWithLeadership() {
    return {
      isLeader: true,
      awaitLeadership: jest.fn().mockReturnValue(new Promise(() => {})),
      die: jest.fn(),
    };
  }

  // Become leader in 100ms
  function createElectorWithDelayedLeadership() {
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
    return mockedElector;
  }


  describe('start', () => {
    it('creates elector and awaits leadership', () => {
      const elector = createElectorWithLeadership();
      jest.spyOn(mocked.broadcastChannel, 'createLeaderElection').mockReturnValue(elector);
      const service = createService();
      service.start();
      expect(service.isStarted()).toBeTruthy();
      expect((service as any).elector).toStrictEqual(elector);
      expect(elector.awaitLeadership).toHaveBeenCalledTimes(1);
    });

    it('stops service if already started', async () => {
      const elector = createElectorWithLeadership();
      jest.spyOn(mocked.broadcastChannel, 'createLeaderElection').mockReturnValue(elector);
      const service = createService();
      service.start();
      service.start();
      expect(service.isStarted()).toBeTruthy();
      expect(elector.die).toHaveBeenCalledTimes(1);
    });
  });

  describe('stop', () => {
    it('should kill elector', () => {
      const elector = createElectorWithLeadership();
      jest.spyOn(mocked.broadcastChannel, 'createLeaderElection').mockReturnValue(elector);
      const service = createService();
      service.start();
      service.stop();
      expect(service.isStarted()).toBeFalsy();
      expect(elector.die).toHaveBeenCalledTimes(1);
    });

    it('can be called twice without error', async () => {
      const elector = createElectorWithLeadership();
      jest.spyOn(mocked.broadcastChannel, 'createLeaderElection').mockReturnValue(elector);
      const service = createService();
      service.start();
      expect(service.isStarted()).toBeTruthy();
      await Promise.race([
        service.stop(),
        service.stop()
      ]);
      expect(service.isStarted()).toBeFalsy();
      expect(elector.die).toHaveBeenCalledTimes(1);
    });
  });

  describe('isLeader', () => {
    it('returns true if current tab is elected as leader', () => {
      const elector = createElectorWithLeadership();
      jest.spyOn(mocked.broadcastChannel, 'createLeaderElection').mockReturnValue(elector);
      const service = createService();
      expect(service.isLeader()).toBeFalsy();
      service.start();
      expect(service.isLeader()).toBeTruthy();
    });
  });

  describe('options.onLeader', () => {
    it('is called after obtaining leadership', async () => {
      const onLeader = jest.fn();
      const elector = createElectorWithDelayedLeadership();
      jest.spyOn(mocked.broadcastChannel, 'createLeaderElection').mockReturnValue(elector);
      const service = createService({ onLeader });
      service.start();
      await Promise.resolve();
      expect(onLeader).toHaveBeenCalledTimes(0);
      expect(service.isLeader()).toBeFalsy();
      jest.runAllTimers();
      await Promise.resolve();
      expect(onLeader).toHaveBeenCalledTimes(1);
      expect(service.isLeader()).toBeTruthy();
    });
  });
});