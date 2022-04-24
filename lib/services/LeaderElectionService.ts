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


import { ServiceInterface, ServiceManagerOptions } from '../types';
import {
  BroadcastChannel,
  createLeaderElection,
  LeaderElector
} from 'broadcast-channel';
import { isBrowser } from '../features';

type OnLeaderHandler = (() => void);
type Options = ServiceManagerOptions & {
  onLeader?: OnLeaderHandler;
};

export class LeaderElectionService implements ServiceInterface {
  private options: Options;
  private channel?: BroadcastChannel;
  private elector?: LeaderElector;
  private started = false;

  constructor(options: Options = {}) {
    this.options = options;
    this.onLeaderDuplicate = this.onLeaderDuplicate.bind(this);
    this.onLeader = this.onLeader.bind(this);
  }

  private onLeaderDuplicate() {
  }

  private onLeader() {
    this.options.onLeader?.();
  }

  isLeader() {
    return !!this.elector?.isLeader;
  }

  hasLeader() {
    return !!this.elector?.hasLeader;
  }

  start() {
    this.stop();
    if (this.canStart()) {
      if (!this.channel) {
        const { broadcastChannelName } = this.options;
        this.channel = new BroadcastChannel(broadcastChannelName as string);
      }
      if (!this.elector) {
        this.elector = createLeaderElection(this.channel);
        this.elector.onduplicate = this.onLeaderDuplicate;
        this.elector.awaitLeadership().then(this.onLeader);
      }
      this.started = true;
    }
  }

  stop() {
    if (this.started) {
      this.elector?.die();
      this.elector = undefined;
      this.channel?.close();
      this.channel = undefined;
      this.started = false;
    }
  }

  requiresLeadership() {
    return false;
  }

  isStarted() {
    return this.started;
  }

  canStart() {
    return isBrowser();
  }

}
