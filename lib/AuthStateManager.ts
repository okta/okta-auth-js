import { AuthSdkError } from './errors';
import { AuthState, UpdateAuthStateOptions } from './types';
import { OktaAuth } from './browser';
import { ACCESS_TOKEN_STORAGE_KEY, ID_TOKEN_STORAGE_KEY } from './constants';
const PCancelable = require('p-cancelable');

const DEFAULT_AUTH_STATE = { 
  isPending: true,
  isAuthenticated: false,
  idToken: null,
  accessToken: null,
};
const EVENT_AUTH_STATE_CHANGE = 'authStateChange';

class AuthStateManager {
  _sdk: OktaAuth;
  _pending: { updateAuthStatePromise: typeof PCancelable };
  _authState: AuthState;

  constructor(sdk: OktaAuth) {
    if (!sdk.emitter) {
      throw new AuthSdkError('Emitter should be initialized before AuthStateManager');
    }

    this._sdk = sdk;
    this._pending = { updateAuthStatePromise: null };
    this._authState = { ...DEFAULT_AUTH_STATE };

    // Listen on tokenManager events to sync update tokens in memory (this.pending), and start updateState process
    // "added" event is emitted in both add and renew process
    // Only listen on "added" (instead of both "added" and "renewed") to limit authState re-evaluation
    sdk.tokenManager.on('added', (key, token) => {
      this.updateAuthState({ shouldCheckExpiration: false,  event: 'added', key, token });
    });
    sdk.tokenManager.on('renewed', (key, token) => {
      this.updateAuthState({ shouldCheckExpiration: false,  event: 'renewed', key, token });
    });
    sdk.tokenManager.on('removed', (key, token) => {
      this.updateAuthState({ shouldCheckExpiration: false, event: 'removed', key, token });
    });
  }

  getAuthState(): AuthState {
    return this._authState;
  }

  updateAuthState({ shouldCheckExpiration, event, key, token }: UpdateAuthStateOptions): void {
    const logger = (status) => {
      console.group(`OKTA-AUTH-JS:updateAuthState:event:${event}:${status}`);
      console.log(key, token);
      console.log('Current authState', this._authState);
      console.groupEnd();
    };

    const emitAuthStateChange = (authState) => {
      this._authState = authState;
      // emit new authState object
      this._sdk.emitter.emit(EVENT_AUTH_STATE_CHANGE, { ...authState });
      if (devMode) {
        logger('sent');
      }
    };

    if (this._pending.updateAuthStatePromise) {
      this._pending.updateAuthStatePromise.cancel();
    }

    const { isAuthenticated, devMode } = this._sdk.options;
    const cancelablePromise = new PCancelable((resolve, _, onCancel) => {
      onCancel.shouldReject = false;
      onCancel(() => {
        this._pending.updateAuthStatePromise = null;
        if (devMode) {
          logger('canceled');
        }
      });

      return Promise.all([
        this._sdk.tokenManager.get(ACCESS_TOKEN_STORAGE_KEY),
        this._sdk.tokenManager.get(ID_TOKEN_STORAGE_KEY)
      ]).then(([accessToken, idToken]) => {
        if (cancelablePromise.isCanceled) {
          resolve();
          return;
        }

        if (shouldCheckExpiration) {
          if (accessToken && this._sdk.tokenManager.hasExpired(accessToken)) {
            accessToken = null;
          }
          if (idToken && this._sdk.tokenManager.hasExpired(idToken)) {
            idToken = null;
          }
        }

        let promise = isAuthenticated 
          ? isAuthenticated(this._sdk) 
          : Promise.resolve(!!(accessToken && idToken));
        return promise.then(isAuthenticated => {
          if (cancelablePromise.isCanceled) {
            resolve();
            return;
          }
          emitAuthStateChange({ ...this._authState, accessToken, idToken, isAuthenticated, isPending: false });  
          this._pending.updateAuthStatePromise = null;
          resolve();
        });
      });
    });
    this._pending.updateAuthStatePromise = cancelablePromise;
  }

  onAuthStateChange(handler): void {
    this._sdk.emitter.on(EVENT_AUTH_STATE_CHANGE, handler);
  };

  offAuthStateChange(handler?): void {
    this._sdk.emitter.off(EVENT_AUTH_STATE_CHANGE, handler);
  };
}

export default AuthStateManager;
