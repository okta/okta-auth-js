import { AuthSdkError } from './errors';
import { AuthState, UpdateAuthStateOptions } from './types';
import { OktaAuth } from './browser';
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

class AuthStateManager {
  _sdk: OktaAuth;
  _pending: { 
    updateAuthStatePromise: typeof PCancelable;
    canceledTimes: number; 
  };
  _authState: AuthState;

  constructor(sdk: OktaAuth) {
    if (!sdk.emitter) {
      throw new AuthSdkError('Emitter should be initialized before AuthStateManager');
    }

    this._sdk = sdk;
    this._pending = { ...DEFAULT_PENDING };
    this._authState = { ...DEFAULT_AUTH_STATE };

    // Listen on tokenManager events to start updateState process
    // "added" event is emitted in both add and renew process, just listen on "added" event to update auth state
    sdk.tokenManager.on('added', (key, token) => {
      this.updateAuthState({ event: 'added', key, token });
    });
    sdk.tokenManager.on('removed', (key, token) => {
      this.updateAuthState({ event: 'removed', key, token });
    });
  }

  getAuthState(): AuthState {
    return this._authState;
  }

  updateAuthState({ event, key, token }: UpdateAuthStateOptions = {}): void {
    const { isAuthenticated, devMode } = this._sdk.options;
    const { autoRenew, autoRemove } = this._sdk.tokenManager._getOptions();

    const logger = (status) => {
      console.group(`OKTA-AUTH-JS:updateAuthState: Event:${event} Status:${status}`);
      console.log(key, token);
      console.log('Current authState', this._authState);
      console.groupEnd();
    };

    const emitAuthStateChange = (authState) => {
      if (isSameAuthState(this._authState, authState)) {
        devMode && logger('unchanged'); 
        return;
      }
      this._authState = authState;
      // emit new authState object
      this._sdk.emitter.emit(EVENT_AUTH_STATE_CHANGE, { ...authState });
      devMode && logger('emitted');
    };

    const shouldEvaluateIsPending = () => (autoRenew || autoRemove);

    if (this._pending.updateAuthStatePromise) {
      if (this._pending.canceledTimes >= MAX_PROMISE_CANCEL_TIMES) {
        // stop canceling then starting a new promise
        // let existing promise finish to prevent running into loops
        devMode && logger('terminated');
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
        devMode && logger('canceled');
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
        .then(({ accessToken, idToken }) => {
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
          let promise = isAuthenticated 
            ? isAuthenticated(this._sdk)
            : Promise.resolve(!!(accessToken && idToken));

          promise
            .then(isAuthenticated => emitAndResolve({ 
              ...this._authState,
              accessToken,
              idToken,
              isAuthenticated,
              isPending 
            }))
            .catch(error => emitAndResolve({ 
              ...this._authState, 
              accessToken, 
              idToken, 
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

export default AuthStateManager;
