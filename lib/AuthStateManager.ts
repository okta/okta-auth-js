import { AuthSdkError } from './errors';
import PromiseQueue from './PromiseQueue';
import { omit } from './util';
import { 
  ACCESS_TOKEN_STORAGE_KEY, 
  ID_TOKEN_STORAGE_KEY 
} from './constants';
import { 
  AuthState,
  Tokens, 
  AccessToken, 
  IDToken,
  UpdateAuthStateOptions
} from './types';
import { OktaAuth } from './browser';

const DEFAULT_AUTH_STATE = { 
  isPending: true,
  isAuthenticated: false,
  idToken: null,
  accessToken: null,
};
const EVENT_AUTH_STATE_CHANGE = 'authStateChange';

class AuthStateManager {
  private sdk: OktaAuth;
  private pending: { tokens: Tokens };
  private authStateQueue: PromiseQueue;
  private authState: AuthState;

  constructor(sdk: OktaAuth) {
    if (!sdk.emitter) {
      throw new AuthSdkError('Emitter should be initialized before AuthStateManager');
    }

    this.sdk = sdk;
    this.pending = { tokens: {} };
    this.authStateQueue = new PromiseQueue();
    this.authState = { ...DEFAULT_AUTH_STATE };

    // Listen on tokenManager events to sync update tokens in memory (this.pending)
    // And push async update authState and emit process into PromiseQ

    // "added" event is emitted in both add and renew process
    // Only listen on "added" (instead of both "added" and "renewed") to limit authState re-evaluation
    sdk.tokenManager.on('added', (key, token) => {
      this.pending.tokens = { ...this.pending.tokens, [key]: token };
      this.authStateQueue.push(
        this.updateAuthState, 
        this,
        { ...this.pending.tokens }
      );
    });
    sdk.tokenManager.on('removed', (key) => {
      this.pending.tokens = omit(this.pending.tokens, key);
      this.authStateQueue.push(
        this.updateAuthState, 
        this,
        { ...this.pending.tokens }
      );
    });
  }

  getAuthState(): AuthState {
    return this.authState;
  }

  async initialAuthState(): Promise<void> {
    let accessToken = await this.sdk.tokenManager.get(ACCESS_TOKEN_STORAGE_KEY) as AccessToken;
    if (accessToken && this.sdk.tokenManager.hasExpired(accessToken)) {
      accessToken = null;
    }
    let idToken = await this.sdk.tokenManager.get(ID_TOKEN_STORAGE_KEY) as IDToken;
    if (idToken && this.sdk.tokenManager.hasExpired(idToken)) {
      idToken = null;
    }
    this.updateAuthState({ accessToken, idToken });
  }

  updateAuthState({
    accessToken, 
    idToken,
    shouldEvaluateIsAuthenticated = true
  }: UpdateAuthStateOptions): Promise<void> {
    let promise
    if (shouldEvaluateIsAuthenticated) {
      promise = this.sdk.options.isAuthenticated 
        ? this.sdk.options.isAuthenticated(accessToken, idToken)
        : Promise.resolve(!!(accessToken && idToken));
    } else {
      promise = Promise.resolve(true);
    }

    const emitAuthStateChange = (authState) => {
      this.authState = authState;
      // emit new authState object
      this.sdk.emitter.emit(EVENT_AUTH_STATE_CHANGE, { ...authState });
    }
  
    // The ONLY place that updates authState then emit authStateChange event
    // This guarantees a predictable state when call "getAuthState()" from downstream clients
    return promise.then(isAuthenticated => {
      emitAuthStateChange({ 
        accessToken,
        idToken, 
        isAuthenticated, 
        isPending: false 
      });  
    }).catch(error => {
      emitAuthStateChange({ 
        accessToken: null,
        idToken: null,
        isAuthenticated: false, 
        isPending: false, 
        error
      });
    });
  }

  onAuthStateChange(handler): void {
    this.sdk.emitter.on(EVENT_AUTH_STATE_CHANGE, handler);
  };

  offAuthStateChange(handler?): void {
    this.sdk.emitter.off(EVENT_AUTH_STATE_CHANGE, handler);
  };
}

export default AuthStateManager;
