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

import { BroadcastChannel } from 'broadcast-channel';
import { isBrowser } from '../features';
import {
  ServiceManagerOptions, ServiceInterface
} from '../core/types';
import {
  Token, Tokens, 
  EVENT_ADDED, EVENT_REMOVED, EVENT_RENEWED, EVENT_SET_STORAGE, TokenManagerInterface
} from '../oidc/types';
import { AuthSdkError } from '../errors';

export type SyncMessage = {
  type: string;
  key?: string;
  token?: Token;
  oldToken?: Token;
  storage?: Tokens;
};
export class SyncStorageService implements ServiceInterface {
  private tokenManager: TokenManagerInterface;
  private options: ServiceManagerOptions;
  private channel?: BroadcastChannel<SyncMessage>;
  private started = false;
  private enablePostMessage = true;

  constructor(tokenManager: TokenManagerInterface, options: ServiceManagerOptions = {}) {
    this.tokenManager = tokenManager;
    this.options = options;
    this.onTokenAddedHandler = this.onTokenAddedHandler.bind(this);
    this.onTokenRemovedHandler = this.onTokenRemovedHandler.bind(this);
    this.onTokenRenewedHandler = this.onTokenRenewedHandler.bind(this);
    this.onSetStorageHandler = this.onSetStorageHandler.bind(this);
    this.onSyncMessageHandler = this.onSyncMessageHandler.bind(this);
  }

  requiresLeadership() {
    return false;
  }

  isStarted() {
    return this.started;
  }

  canStart() {
    return !!this.options.syncStorage && isBrowser() && !this.started;
  }

  async start() {
    if (!this.canStart()) {
      return;
    }
    
    const { syncChannelName } = this.options;
    try {
      // BroadcastChannel throws if no supported method can be found
      this.channel = new BroadcastChannel(syncChannelName as string);
    } catch (err) {
      throw new AuthSdkError('SyncStorageService is not supported in current browser.');
    }

    this.tokenManager.on(EVENT_ADDED, this.onTokenAddedHandler);
    this.tokenManager.on(EVENT_REMOVED, this.onTokenRemovedHandler);
    this.tokenManager.on(EVENT_RENEWED, this.onTokenRenewedHandler);
    this.tokenManager.on(EVENT_SET_STORAGE, this.onSetStorageHandler);
    this.channel.addEventListener('message', this.onSyncMessageHandler);
    this.started = true;
  }

  async stop() {
    if (this.started) {
      this.tokenManager.off(EVENT_ADDED, this.onTokenAddedHandler);
      this.tokenManager.off(EVENT_REMOVED, this.onTokenRemovedHandler);
      this.tokenManager.off(EVENT_RENEWED, this.onTokenRenewedHandler);
      this.tokenManager.off(EVENT_SET_STORAGE, this.onSetStorageHandler);
      this.channel?.removeEventListener('message', this.onSyncMessageHandler);
      await this.channel?.close();
      this.channel = undefined;
      this.started = false;
    }
  }

  private onTokenAddedHandler(key: string, token: Token) {
    if (!this.enablePostMessage) {
      return;
    }
    this.channel?.postMessage({
      type: EVENT_ADDED,
      key,
      token
    });
  }

  private onTokenRemovedHandler(key: string, token: Token) {
    if (!this.enablePostMessage) {
      return;
    }
    this.channel?.postMessage({
      type: EVENT_REMOVED,
      key,
      token
    });
  }

  private onTokenRenewedHandler(key: string, token: Token, oldToken?: Token) {
    if (!this.enablePostMessage) {
      return;
    }
    this.channel?.postMessage({
      type: EVENT_RENEWED,
      key,
      token,
      oldToken
    });
  }

  private onSetStorageHandler(storage: Tokens) {
    this.channel?.postMessage({
      type: EVENT_SET_STORAGE,
      storage
    });
  }

  /* eslint-disable complexity */
  private onSyncMessageHandler(msg: SyncMessage) {
    // Notes:
    // 1. Using `enablePostMessage` flag here to prevent sync message loop.
    //    If this flag is on, tokenManager event handlers do not post sync message.
    // 2. IE11 has known issue with synchronization of LocalStorage cross tabs.
    //    One workaround is to set empty event handler for `window.onstorage`.
    //    But it's not 100% working, sometimes you still get old value from LocalStorage.
    //    Better approch is to explicitly udpate LocalStorage with `setStorage`.

    this.enablePostMessage = false;
    switch (msg.type) {
      case EVENT_SET_STORAGE:
        this.tokenManager.getStorage().setStorage(msg.storage);
        break;
      case EVENT_ADDED:
        this.tokenManager.emitAdded(msg.key!, msg.token!);
        this.tokenManager.setExpireEventTimeout(msg.key!, msg.token!);
        break;
      case EVENT_REMOVED:
        this.tokenManager.clearExpireEventTimeout(msg.key!);
        this.tokenManager.emitRemoved(msg.key!, msg.token!);
        break;
      case EVENT_RENEWED:
        this.tokenManager.emitRenewed(msg.key!, msg.token!, msg.oldToken);
        break;
      default:
        break;
    }
    this.enablePostMessage = true;
  }
} 