import { OktaAuthCoreInterface } from './types';
import { TokenManager } from '../oidc';
import { TOKEN_STORAGE_NAME } from '../constants';
import { ServiceManager } from './ServiceManager';

export class TokenSet {
  private sdk: OktaAuthCoreInterface;
  private map: Map<string, any>; // TODO: add type

  constructor(sdk: OktaAuthCoreInterface) {
    this.sdk = sdk;

    this.map = new Map();
    const options = sdk.options;
    const tokenManager = new TokenManager(this.sdk, options.tokenManager);
    const serviceManager = new ServiceManager(this.sdk, options.services);
    this.map.set(TOKEN_STORAGE_NAME, {
      tokenManager,
      serviceManager,
    });
  }

  start(key?: string) {
    // start services for one or all token sets
  }

  stop(key?: string) {
    // stop services for one or all token sets
  }

  // call this method when need to add a new token set, like after receiving new tokens from authorize/idx
  addTokenSet(tokens, options) {
    const storageKey = options.storageKey;
    const tokenManager = new TokenManager(this.sdk, options.tokenManager); // with specific storageKey
    const serviceManager = new ServiceManager(this.sdk, options.services);
    this.map.set(storageKey, {
      tokenManager,
      serviceManager,
    });

    tokenManager.setTokens(tokens);

    if (options.default) {
      this.useTokenSet(options.tokenManager.storageKey);
    }
  }

  useTokenSet(key) {
    const tokenSet = this.map.get(key);
    this.sdk.tokenManager = tokenSet.tokenManager;
    this.sdk.serviceManager = tokenSet.serviceManager;
    // sync authState with new token set
    this.sdk.authStateManager.updateAuthState();
  }
}
