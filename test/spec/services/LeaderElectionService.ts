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
import { BroadcastChannel } from 'broadcast-channel';

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
  let channel;
  let service;
  beforeEach(function() {
    jest.useFakeTimers();
    channel = null;
    service = null;
  });
  afterEach(() => {
    jest.useRealTimers();
    if (service) {
      service.stop();
    }
    if (channel) {
      channel.close();
    }
  });

  function createService(options?) {
    service = new LeaderElectionService({
      ...options,
      electionChannelName: 'electionChannel'
    });
    service.start();
    channel = new BroadcastChannel('electionChannel');
    return service;
  }

  it('can await leadership and then call onLeader', async () => {
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

    const onLeader = jest.fn();
    jest.spyOn(mocked.broadcastChannel, 'createLeaderElection').mockReturnValue(mockedElector);
    const service = createService({ onLeader });
    await Promise.resolve();
    expect(onLeader).toHaveBeenCalledTimes(0);
    expect(service.isLeader()).toBeFalsy();
    jest.runAllTimers();
    await Promise.resolve();
    expect(onLeader).toHaveBeenCalledTimes(1);
    expect(service.isLeader()).toBeTruthy();
  });
});