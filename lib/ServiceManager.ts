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


import {
  ServiceManagerInterface,
  ServiceInterface,
  ServiceManagerOptions
} from './types';
import { OktaAuth } from '.';
import { AutoRenewService, SyncStorageService, LeaderElectionService } from './services';
import { removeNils } from './util';

const AUTO_RENEW = 'autoRenew';
const SYNC_STORAGE = 'syncStorage';
const LEADER_ELECTION = 'leaderElection';

export class ServiceManager implements ServiceManagerInterface {
  private sdk: OktaAuth;
  private options: ServiceManagerOptions;
  private services: Map<string, ServiceInterface>;
  private started: boolean;

  private static knownServices = [AUTO_RENEW, SYNC_STORAGE, LEADER_ELECTION];

  private static defaultOptions = {
    autoRenew: true,
    autoRemove: true,
    syncStorage: true
  };

  constructor(sdk: OktaAuth, options: ServiceManagerOptions = {}) {
    this.sdk = sdk;
    this.onLeader = this.onLeader.bind(this);

    // TODO: backwards compatibility, remove in next major version - OKTA-473815
    const { autoRenew, autoRemove, syncStorage } = sdk.tokenManager.getOptions();
    options.electionChannelName = options.electionChannelName || options.broadcastChannelName;
    this.options = Object.assign({}, 
      ServiceManager.defaultOptions,
      { autoRenew, autoRemove, syncStorage }, 
      {
        electionChannelName: `${sdk.options.clientId}-election`,
        syncChannelName: `${sdk.options.clientId}-sync`,
      },
      removeNils(options)
    );

    this.started = false;
    this.services = new Map();

    ServiceManager.knownServices.forEach(name => {
      const svc = this.createService(name);
      if (svc) {
        this.services.set(name, svc);
      }
    });
  }

  private async onLeader() {
    if (this.started) {
      // Start services that requires leadership
      await this.startServices();
    }
  }

  isLeader() {
    return (this.getService(LEADER_ELECTION) as LeaderElectionService)?.isLeader();
  }

  isLeaderRequired() {
    return [...this.services.values()].some(srv => srv.canStart() && srv.requiresLeadership());
  }

  async start() {
    if (this.started) {
      return;     // noop if services have already started
    }
    await this.startServices();
    this.started = true;
  }
  
  async stop() {
    await this.stopServices();
    this.started = false;
  }

  getService(name: string): ServiceInterface | undefined {
    return this.services.get(name);
  }

  private async startServices() {
    for (const [name, srv] of this.services.entries()) {
      if (this.canStartService(name, srv)) {
        await srv.start();
      }
    }
  }

  private async stopServices() {
    for (const srv of this.services.values()) {
      await srv.stop();
    }
  }

  // eslint-disable-next-line complexity
  private canStartService(name: string, srv: ServiceInterface): boolean {
    let canStart = srv.canStart() && !srv.isStarted();
    // only start election if a leader is required
    if (name === LEADER_ELECTION) {
      canStart &&= this.isLeaderRequired();
    } else if (srv.requiresLeadership()) {
      canStart &&= this.isLeader();
    }
    return canStart;
  }

  private createService(name: string): ServiceInterface {
    const tokenManager = this.sdk.tokenManager;

    let service: ServiceInterface;
    switch (name) {
      case LEADER_ELECTION:
        service = new LeaderElectionService({...this.options, onLeader: this.onLeader});
        break;
      case AUTO_RENEW:
        service = new AutoRenewService(tokenManager, {...this.options});
        break;
      case SYNC_STORAGE:
        service = new SyncStorageService(tokenManager, {...this.options});
        break;
      default:
        throw new Error(`Unknown service ${name}`);
    }
    return service;
  }

}
