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
 
// @ts-ignore 
// Do not use this type in code, so it won't be emitted in the declaration output
import PCancelable from 'p-cancelable';
import { AuthSdkError } from './errors';
import { AuthState, AuthStateLogOptions } from './types';
import { OktaAuth } from '.';
import { getConsole } from './util';
import { EVENT_ADDED, EVENT_REMOVED } from './TokenManager';
import PromiseQueue from './PromiseQueue';

export const INITIAL_AUTH_STATE = null;
const DEFAULT_PENDING = {
  updateAuthStatePromise: null,
  canceledTimes: 0
};
const EVENT_AUTH_STATE_CHANGE = 'authStateChange';
const MAX_PROMISE_CANCEL_TIMES = 10;

// only compare first level of authState
const isSameAuthState = (prevState: AuthState | null, state: AuthState) => {
  // initial state is null
  if (!prevState) {
    return false;
  }

  return prevState.isAuthenticated === state.isAuthenticated 
    && JSON.stringify(prevState.idToken) === JSON.stringify(state.idToken)
    && JSON.stringify(prevState.accessToken) === JSON.stringify(state.accessToken)
    && prevState.error === state.error;
};


export class AuthStateManager {
  _sdk: OktaAuth;
  _pending: { 
    updateAuthStatePromise: any;
    canceledTimes: number; 
  };
  _authState: AuthState | null;
  _prevAuthState: AuthState | null;
  _logOptions: AuthStateLogOptions;
  _transformQueue: PromiseQueue;

  constructor(sdk: OktaAuth) {
    if (!sdk.emitter) {
      throw new AuthSdkError('Emitter should be initialized before AuthStateManager');
    }

    this._sdk = sdk;
    this._pending = { ...DEFAULT_PENDING };
    this._authState = INITIAL_AUTH_STATE;
    this._logOptions = {};
    this._prevAuthState = null;
    this._transformQueue = new PromiseQueue({
      quiet: true
    });

    // Listen on tokenManager events to start updateState process
    // "added" event is emitted in both add and renew process
    // Only listen on "added" event to update auth state
    sdk.tokenManager.on(EVENT_ADDED, (key, token) => {
      this._setLogOptions({ event: EVENT_ADDED, key, token });
      this.updateAuthState();
    });
    sdk.tokenManager.on(EVENT_REMOVED, (key, token) => {
      this._setLogOptions({ event: EVENT_REMOVED, key, token });
      this.updateAuthState();
    });
  }

  _setLogOptions(options) {
    this._logOptions = options;
  }

  getAuthState(): AuthState | null {
    return this._authState;
  }

  getPreviousAuthState(): AuthState | null {
    return this._prevAuthState;
  }

  async updateAuthState(): Promise<AuthState> {
    const { transformAuthState, devMode } = this._sdk.options;

    const log = (status) => {
      const { event, key, token } = this._logOptions;
      getConsole().group(`OKTA-AUTH-JS:updateAuthState: Event:${event} Status:${status}`);
      getConsole().log(key, token);
      getConsole().log('Current authState', this._authState);
      getConsole().groupEnd();
      
      // clear log options after logging
      this._logOptions = {};
    };

    const emitAuthStateChange = (authState) => {
      if (isSameAuthState(this._authState, authState)) {
        devMode && log('unchanged'); 
        return;
      }
      this._prevAuthState = this._authState;
      this._authState = authState;
      // emit new authState object
      this._sdk.emitter.emit(EVENT_AUTH_STATE_CHANGE, { ...authState });
      devMode && log('emitted');
    };

    const finalPromise = (origPromise) => {       
      return this._pending.updateAuthStatePromise.then(() => {
        const curPromise = this._pending.updateAuthStatePromise;
        if (curPromise && curPromise !== origPromise) {
          return finalPromise(curPromise);
        }
        return this.getAuthState();
      });
    };

    if (this._pending.updateAuthStatePromise) {
      if (this._pending.canceledTimes >= MAX_PROMISE_CANCEL_TIMES) {
        // stop canceling then starting a new promise
        // let existing promise finish to prevent running into loops
        devMode && log('terminated');
        return finalPromise(this._pending.updateAuthStatePromise);
      } else {
        this._pending.updateAuthStatePromise.cancel();
      }
    }

    /* eslint-disable complexity */
    const cancelablePromise = new PCancelable((resolve, _, onCancel) => {
      onCancel.shouldReject = false;
      onCancel(() => {
        this._pending.updateAuthStatePromise = null;
        this._pending.canceledTimes = this._pending.canceledTimes + 1;
        devMode && log('canceled');
      });

      const emitAndResolve = (authState) => {
        if (cancelablePromise.isCanceled) {
          resolve();
          return;
        }
        // emit event and resolve promise 
        emitAuthStateChange(authState);
        resolve();

        // clear pending states after resolve
        this._pending = { ...DEFAULT_PENDING };
      };

      this._sdk.isAuthenticated()
        .then(() => {
          if (cancelablePromise.isCanceled) {
            resolve();
            return;
          }

          const { accessToken, idToken, refreshToken } = this._sdk.tokenManager.getTokensSync();
          const authState = {
            accessToken,
            idToken,
            refreshToken,
            isAuthenticated: !!(accessToken && idToken)
          };

          // Enqueue transformAuthState so that it does not run concurrently
          const promise: Promise<AuthState> = transformAuthState
            ? this._transformQueue.push(transformAuthState, null, this._sdk, authState) as Promise<AuthState>
            : Promise.resolve(authState);

          promise
            .then(authState => emitAndResolve(authState))
            .catch(error => emitAndResolve({
              accessToken, 
              idToken, 
              refreshToken,
              isAuthenticated: false, 
              error
            }));
        });
    });
    /* eslint-enable complexity */
    this._pending.updateAuthStatePromise = cancelablePromise;

    return finalPromise(cancelablePromise);
  }

  subscribe(handler): void {
    this._sdk.emitter.on(EVENT_AUTH_STATE_CHANGE, handler);
  }

  unsubscribe(handler?): void {
    this._sdk.emitter.off(EVENT_AUTH_STATE_CHANGE, handler);
  }
}
