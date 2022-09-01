import { REFERRER_PATH_STORAGE_KEY } from '../../constants';
import browserStorage from '../../browser/browserStorage';
import { OktaAuthStorageInterface } from '../../storage';
import { OktaAuthConstructor } from '../../base';
import {
  OAuthStorageManagerInterface,
  OAuthTransactionMeta,
  OktaAuthOAuthOptions,
  OriginalUriApi,
  PKCETransactionMeta,
} from '../types';

export function provideOriginalUri
<
  M extends OAuthTransactionMeta = PKCETransactionMeta,
  S extends OAuthStorageManagerInterface<M> = OAuthStorageManagerInterface<M>,
  O extends OktaAuthOAuthOptions = OktaAuthOAuthOptions,
  TBase extends OktaAuthConstructor<OktaAuthStorageInterface<S, O>>
    = OktaAuthConstructor<OktaAuthStorageInterface<S, O>> 
>
(BaseClass: TBase) {
  return class WithOriginalUri extends BaseClass implements OriginalUriApi {
    setOriginalUri(originalUri: string, state?: string): void {
      // always store in session storage
      const sessionStorage = browserStorage.getSessionStorage();
      sessionStorage.setItem(REFERRER_PATH_STORAGE_KEY, originalUri);
  
      // to support multi-tab flows, set a state in constructor or pass as param
      state = state || this.options.state;
      if (state) {
        const sharedStorage = this.storageManager.getOriginalUriStorage();
        sharedStorage.setItem(state, originalUri);
      }
    }
  
    getOriginalUri(state?: string): string | undefined {
      // Prefer shared storage (if state is available)
      state = state || this.options.state;
      if (state) {
        const sharedStorage = this.storageManager.getOriginalUriStorage();
        const originalUri = sharedStorage.getItem(state);
        if (originalUri) {
          return originalUri;
        }
      }
  
      // Try to load from session storage
      const storage = browserStorage.getSessionStorage();
      return storage ? storage.getItem(REFERRER_PATH_STORAGE_KEY) || undefined : undefined;
    }
  
    removeOriginalUri(state?: string): void {
      // Remove from sessionStorage
      const storage = browserStorage.getSessionStorage();
      storage.removeItem(REFERRER_PATH_STORAGE_KEY);
  
      // Also remove from shared storage
      state = state || this.options.state;
      if (state) {
        const sharedStorage = this.storageManager.getOriginalUriStorage();
        sharedStorage.removeItem && sharedStorage.removeItem(state);
      }
    }
  };
}
