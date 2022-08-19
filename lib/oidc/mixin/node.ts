
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
(BaseClass: TBase) //: TBase & OktaAuthConstructor<O, I & OriginalUriApi>
{
  return class NodeOriginalUri extends BaseClass implements OriginalUriApi {
    setOriginalUri(originalUri: string, state?: string): void {
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
    }
  
    removeOriginalUri(state?: string): void {
      // remove from shared storage
      state = state || this.options.state;
      if (state) {
        const sharedStorage = this.storageManager.getOriginalUriStorage();
        sharedStorage.removeItem && sharedStorage.removeItem(state);
      }
    }
  };
}
