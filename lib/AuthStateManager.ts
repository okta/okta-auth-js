import { AuthSdkError } from './errors';
import { AuthState, AuthStateLogOptions } from './types';
import { OktaAuth } from './browser';
import { getConsole, warn } from './util';
import { EVENT_ADDED, EVENT_REMOVED } from './TokenManager';
const PCancelable = require('p-cancelable');

export const DEFAULT_AUTH_STATE = { 
  isPending: true,
  isAuthenticated: false,
  idToken: null,
  accessToken: null,
};
const DEFAULT_PENDING = {
  updateAuthStatePromise: null,
  canceledTimes: 0
};
const EVENT_AUTH_STATE_CHANGE = 'authStateChange';
const MAX_PROMISE_CANCEL_TIMES = 10;

// only compare first level of authState
const isSameAuthState = (prevState: AuthState, state: AuthState) => {
  return prevState.isPending === state.isPending 
    && prevState.isAuthenticated === state.isAuthenticated 
    && JSON.stringify(prevState.idToken) === JSON.stringify(state.idToken)
    && JSON.stringify(prevState.accessToken) === JSON.stringify(state.accessToken)
    && prevState.error === state.error;
};

export class AuthStateManager {
  _sdk: OktaAuth;
  _pending: { 
    updateAuthStatePromise: typeof PCancelable;
    canceledTimes: number; 
  };
  _authState: AuthState;
  _logOptions: AuthStateLogOptions;
  _lastEventTimestamp: number;

  constructor(sdk: OktaAuth) {
    if (!sdk.emitter) {
      throw new AuthSdkError('Emitter should be initialized before AuthStateManager');
    }

    this._sdk = sdk;
    this._pending = { ...DEFAULT_PENDING };
    this._authState = { ...DEFAULT_AUTH_STATE };
    this._logOptions = {};

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

  getAuthState(): AuthState {
    return this._authState;
  }

  updateAuthState(): void {
    if (!this._sdk.emitter.e 
        || !this._sdk.emitter.e[EVENT_AUTH_STATE_CHANGE] 
        || !this._sdk.emitter.e[EVENT_AUTH_STATE_CHANGE].length) {
      warn('updateAuthState is an asynchronous method with no return, ' + 
        'please subscribe to the latest authState update with ' + 
        'authStateManager.subscribe(handler) method before calling updateAuthState.');
    }

    const { transformAuthState, devMode } = this._sdk.options;
    const { autoRenew, autoRemove } = this._sdk.tokenManager._getOptions();

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
      this._authState = authState;
      // emit new authState object
      this._sdk.emitter.emit(EVENT_AUTH_STATE_CHANGE, { ...authState });
      devMode && log('emitted');
    };

    const shouldEvaluateIsPending = () => (autoRenew || autoRemove);

    if (this._pending.updateAuthStatePromise) {
      if (this._pending.canceledTimes >= MAX_PROMISE_CANCEL_TIMES) {
        // stop canceling then starting a new promise
        // let existing promise finish to prevent running into loops
        devMode && log('terminated');
        return;
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
        // emit event and clear pending states
        emitAuthStateChange(authState); 
        this._pending = { ...DEFAULT_PENDING };
        resolve();
      };

      this._sdk.tokenManager.getTokens()
        .then(({ accessToken, idToken, refreshToken }) => {
          if (cancelablePromise.isCanceled) {
            resolve();
            return;
          }

          // evaluate isPending if any token is expired
          // then wait for next renewed event to evaluate a new state with valid tokens
          // isPending state should only apply to token driven evaluation
          let isPending = false;
          if (accessToken && this._sdk.tokenManager.hasExpired(accessToken)) {
            accessToken = null;
            isPending = shouldEvaluateIsPending();
          }
          if (idToken && this._sdk.tokenManager.hasExpired(idToken)) {
            idToken = null;
            isPending = shouldEvaluateIsPending();
          }
          const authState = {
            accessToken,
            idToken,
            refreshToken,
            isPending,
            isAuthenticated: !!(accessToken && idToken)
          };
          const promise: Promise<AuthState> = transformAuthState
            ? transformAuthState(this._sdk, authState)
            : Promise.resolve(authState);

          promise
            .then(authState => emitAndResolve(authState))
            .catch(error => emitAndResolve({
              accessToken, 
              idToken, 
              refreshToken,
              isAuthenticated: false, 
              isPending: false,
              error
            }));
        });
    });
    /* eslint-enable complexity */
    this._pending.updateAuthStatePromise = cancelablePromise;
  }

  subscribe(handler): void {
    this._sdk.emitter.on(EVENT_AUTH_STATE_CHANGE, handler);
  }

  unsubscribe(handler?): void {
    this._sdk.emitter.off(EVENT_AUTH_STATE_CHANGE, handler);
  }
}
