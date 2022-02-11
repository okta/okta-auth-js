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


/* global window */
import { TokenService } from './TokenService';
import { TokenManager, EVENT_EXPIRED } from '../TokenManager';
import { AuthSdkError } from '../errors';
import { TokenManagerOptions, AutoRenewServiceOptions } from '../types';

function shouldThrottleRenew(renewTimeQueue) {
  let res = false;
  renewTimeQueue.push(Date.now());
  if (renewTimeQueue.length >= 10) {
    // get and remove first item from queue
    const firstTime = renewTimeQueue.shift();
    const lastTime = renewTimeQueue[renewTimeQueue.length - 1];
    res = lastTime - firstTime < 30 * 1000;
  }
  return res;
}

export class AutoRenewService extends TokenService {
  private onTokenExpiredHandler?: (key: string) => void;

  constructor(tokenManager: TokenManager, options: TokenManagerOptions = {}) {
    super(tokenManager, options);
    this.onTokenExpiredHandler = undefined;
  }

  start() {
    const { enableActiveRenew } = <AutoRenewServiceOptions>this.options.autoRenew!;
    const renewTimeQueue = [];
    this.onTokenExpiredHandler = (key) => {
      if (enableActiveRenew) {
        if (shouldThrottleRenew(renewTimeQueue)) {
          const error = new AuthSdkError('Too many token renew requests');
          this.tokenManager.emitError(error);
        } else {
          this.tokenManager.renew(key).catch(() => {}); // Renew errors will emit an "error" event 
        }
      } else if (this.options.autoRemove) {
        this.tokenManager.remove(key);
      }
    };
    this.tokenManager.on(EVENT_EXPIRED, this.onTokenExpiredHandler);

    this.tokenManager.setExpireEventTimeoutAll();
  }

  stop() {
    this.tokenManager.clearExpireEventTimeoutAll();
    this.tokenManager.off(EVENT_EXPIRED, this.onTokenExpiredHandler);
  }
}