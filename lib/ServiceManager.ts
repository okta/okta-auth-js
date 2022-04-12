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
import {
  BroadcastChannel,
  createLeaderElection,
  LeaderElector
} from 'broadcast-channel';
import { AutoRenewService, SyncStorageService } from './services';
import { isBrowser } from './features';

export class ServiceManager implements ServiceManagerInterface {
  private sdk: OktaAuth;
  private options: ServiceManagerOptions;
  private services: Map<string, ServiceInterface>;
  private channel?: BroadcastChannel;
  private elector?: LeaderElector;
  private started: boolean;

  private static knownServices = ['autoRenew', 'syncStorage'];

  private static defaultOptions = {
    autoRenew: true,
    autoRemove: true,
    syncStorage: true
  };

  constructor(sdk: OktaAuth, options: ServiceManagerOptions = {}) {
    this.sdk = sdk;

    // TODO: backwards compatibility, remove in next major version - OKTA-473815
    const { autoRenew, autoRemove, syncStorage } = sdk.tokenManager.getOptions();
    this.options = Object.assign({}, 
      ServiceManager.defaultOptions,
      { autoRenew, autoRemove, syncStorage },
      options
    );

    this.started = false;
    this.services = new Map();
    this.onLeaderDuplicate = this.onLeaderDuplicate.bind(this);
    this.onLeader = this.onLeader.bind(this);

    ServiceManager.knownServices.forEach(name => {
      const svc = this.createService(name);
      if (svc) {
        this.services.set(name, svc);
      }
    });
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

  isLeaderRequired() {
    return [...this.services.values()].some(srv => srv.requiresLeadership());
  }

  start() {
    if (this.started) {
      return;     // noop if services are already started
    }
    // only start election if a leader is required
    if (this.isLeaderRequired()) {
      this.startElector();
    }
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
    for (const srv of this.services.values()) {
      const canStart = srv.canStart() && !srv.isStarted() && (srv.requiresLeadership() ? this.isLeader() : true);
      if (canStart) {
        srv.start();
      }
    }
  }

  private stopServices() {
    for (const srv of this.services.values()) {
      srv.stop();
    }
  }

  private startElector() {
    this.stopElector();
    if (ServiceManager.canUseLeaderElection()) {
      if (!this.channel) {
        const { broadcastChannelName } = this.options;
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
    if (this.elector) {
      this.elector?.die();
      this.elector = undefined;
      this.channel?.close();
      this.channel = undefined;
    }
  }

  private createService(name: string): ServiceInterface {
    const tokenManager = this.sdk.tokenManager;

    let service: ServiceInterface | undefined;
    switch (name) {
      case 'autoRenew':
        service = new AutoRenewService(tokenManager, {...this.options});
        break;
      case 'syncStorage':
        service = new SyncStorageService(tokenManager, {...this.options});
        break;
      default:
        throw new Error(`Unknown service ${name}`);
    }
    return service;
  }

}
