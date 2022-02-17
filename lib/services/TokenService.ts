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


import { TokenManager } from '../TokenManager';
import { TokenManagerOptions, TokenServiceInterface } from '../types';

export abstract class TokenService implements TokenServiceInterface {
  protected tokenManager: TokenManager;
  protected options: TokenManagerOptions;
  private started: boolean;

  constructor(tokenManager: TokenManager, options: TokenManagerOptions = {}) {
    this.tokenManager = tokenManager;
    this.options = options;
    this.started = false;
  }

  abstract _start(): void;
  abstract _stop(): void;

  start() {
    this.stop();
    if (this.canStart()) {
      this._start();
      this.started = true;
    }
  }

  stop() {
    if (this.started) {
      this._stop();
    }
    this.started = false;
  }

  canStart() {
    return true;
  }

  requiresLeadership() {
    return false;
  }

  isStarted() {
    return this.started;
  }
}