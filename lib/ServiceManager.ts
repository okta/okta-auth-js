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
  OktaAuthOptions,
  ServiceManagerInterface,
  ServiceInterface
} from './types';
import { OktaAuth } from '.';
import {
  BroadcastChannel,
  createLeaderElection,
  LeaderElector
} from 'broadcast-channel';
import { AutoRenewService, SyncStorageService } from './services';
import { isBrowser } from './features';

export class ServiceManager implements ServiceManagerInterface {
  private sdk: OktaAuth;
  private options: OktaAuthOptions;
  private services: Map<string, ServiceInterface>;
  private channel?: BroadcastChannel;
  private elector?: LeaderElector;
  private started: boolean;

  private static knownServices = ['autoRenew', 'syncStorage'];

  constructor(sdk: OktaAuth) {
    this.sdk = sdk;
    this.options = { ...sdk.options, tokenManager: sdk.tokenManager.getOptions() };

    this.options.services ??= {};
    this.options.services = Object.assign({broadcastChannelName: sdk.options.clientId}, {...this.options.services});

    this.started = false;
    this.services = new Map();
    this.onLeaderDuplicate = this.onLeaderDuplicate.bind(this);
    this.onLeader = this.onLeader.bind(this);
  }

  public static canUseLeaderElection() {
    return isBrowser();
  }

  private onLeader() {
    if (this.started) {
      // Start services that requires leadership
      this.startServices();
    }
  }

  private onLeaderDuplicate() {
  }

  isLeader() {
    return !!this.elector?.isLeader;
  }

  hasLeader() {
    return this.elector?.hasLeader;
  }

  start() {
    if (this.started) {
      this.stop();
    }
    this.startElector();
    this.startServices();
    this.started = true;
  }
  
  stop() {
    this.stopElector();
    this.stopServices();
    this.started = false;
  }

  getService(name: string): ServiceInterface | undefined {
    return this.services.get(name);
  }

  private startServices() {
    for (const name of ServiceManager.knownServices) {
      const srv = this.createService(name);
      if (srv) {
        const canStart = srv.canStart() && !srv.isStarted() && (srv.requiresLeadership() ? this.isLeader() : true);
        if (canStart) {
          srv.start();
          this.services.set(name, srv);
        }
      }
    }
  }

  private stopServices() {
    for (const srv of this.services.values()) {
      srv.stop();
    }
    this.services = new Map();
  }

  private startElector() {
    if (ServiceManager.canUseLeaderElection()) {
      if (!this.channel) {
        const { broadcastChannelName } = this.options.services!;
        this.channel = new BroadcastChannel(broadcastChannelName as string);
      }
      if (!this.elector) {
        this.elector = createLeaderElection(this.channel);
        this.elector.onduplicate = this.onLeaderDuplicate;
        this.elector.awaitLeadership().then(this.onLeader);
      }
    }
  }

  private stopElector() {
    this.elector?.die();
    this.elector = undefined;
  }

  private createService(name: string): ServiceInterface | undefined {
    const tokenManager = this.sdk.tokenManager;
    
    let service: ServiceInterface | undefined;
    switch (name) {
      case 'autoRenew':
        service = new AutoRenewService(tokenManager, this.options.tokenManager);
        break;
      case 'syncStorage':
        service = new SyncStorageService(tokenManager, this.options.tokenManager);
        break;
      default:
        throw new Error(`Unknown service ${name}`);
    }
    return service;
  }

}
