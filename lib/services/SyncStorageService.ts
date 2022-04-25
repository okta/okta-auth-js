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

import { TokenManager, EVENT_ADDED, EVENT_REMOVED, EVENT_RENEWED } from '../TokenManager';
import { BroadcastChannel } from 'broadcast-channel';
import { isBrowser } from '../features';
import { ServiceManagerOptions, ServiceInterface, Token } from '../types';

export type SyncMessage = {
  type: string;
  key: string;
  token: Token;
  oldToken?: Token;
};
export class SyncStorageService implements ServiceInterface {
  private tokenManager: TokenManager;
  private options: ServiceManagerOptions;
  private channel?: BroadcastChannel<SyncMessage>;
  private started = false;

  constructor(tokenManager: TokenManager, options: ServiceManagerOptions = {}) {
    this.tokenManager = tokenManager;
    this.options = options;
    this.onTokenAddedHandler = this.onTokenAddedHandler.bind(this);
    this.onTokenRemovedHandler = this.onTokenRemovedHandler.bind(this);
    this.onTokenRenewedHandler = this.onTokenRenewedHandler.bind(this);
    this.onSyncMessageHandler = this.onSyncMessageHandler.bind(this);
  }

  requiresLeadership() {
    return false;
  }

  isStarted() {
    return this.started;
  }

  canStart() {
    return !!this.options.syncStorage && isBrowser();
  }

  start() {
    if (this.canStart()) {
      this.stop();
      const { syncChannelName } = this.options;
      this.channel = new BroadcastChannel(syncChannelName as string);
      this.tokenManager.on(EVENT_ADDED, this.onTokenAddedHandler);
      this.tokenManager.on(EVENT_REMOVED, this.onTokenRemovedHandler);
      this.tokenManager.on(EVENT_RENEWED, this.onTokenRenewedHandler);
      this.channel.addEventListener('message', this.onSyncMessageHandler);
      this.started = true;
    }
  }

  private onTokenAddedHandler(key: string, token: Token) {
    this.channel?.postMessage({
      type: EVENT_ADDED,
      key,
      token
    });
  }

  private onTokenRemovedHandler(key: string, token: Token) {
    this.channel?.postMessage({
      type: EVENT_REMOVED,
      key,
      token
    });
  }

  private onTokenRenewedHandler(key: string, token: Token, oldToken?: Token) {
    this.channel?.postMessage({
      type: EVENT_RENEWED,
      key,
      token,
      oldToken
    });
  }

  private onSyncMessageHandler(msg: SyncMessage) {
    switch (msg.type) {
      case EVENT_ADDED:
        this.tokenManager.emitAdded(msg.key, msg.token);
        this.tokenManager.setExpireEventTimeout(msg.key, msg.token);
        break;
      case EVENT_REMOVED:
        this.tokenManager.clearExpireEventTimeout(msg.key);
        this.tokenManager.emitRemoved(msg.key, msg.token);
        break;
      case EVENT_RENEWED:
        this.tokenManager.clearExpireEventTimeout(msg.key);
        this.tokenManager.emitRenewed(msg.key, msg.token, msg.oldToken);
        this.tokenManager.setExpireEventTimeout(msg.key, msg.token);
        break;
      default:
        throw new Error(`Unknown message type ${msg.type}`);
    }
  }

  stop() {
    if (this.started) {
      this.tokenManager.off(EVENT_ADDED, this.onTokenAddedHandler);
      this.tokenManager.off(EVENT_REMOVED, this.onTokenRemovedHandler);
      this.channel?.removeEventListener('message', this.onSyncMessageHandler);
      this.channel?.close();
      this.channel = undefined;
      this.started = false;
    }
  }
} 