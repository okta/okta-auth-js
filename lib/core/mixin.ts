import { parseOAuthResponseFromUrl } from '../oidc/parseFromUrl';
import { OktaAuthConstructor } from '../base/types';
import {
  OAuthStorageManagerInterface,
  OAuthTransactionMeta,
  OktaAuthOAuthInterface,
  PKCETransactionMeta,
  Tokens,
  TransactionManagerInterface,
} from '../oidc/types';
import { AuthStateManager } from './AuthStateManager';
import { ServiceManager } from './ServiceManager';
import { OktaAuthCoreInterface, OktaAuthCoreOptions } from './types';

export function mixinCore
<
  M extends OAuthTransactionMeta = PKCETransactionMeta,
  S extends OAuthStorageManagerInterface<M> = OAuthStorageManagerInterface<M>,
  O extends OktaAuthCoreOptions = OktaAuthCoreOptions,
  TM extends TransactionManagerInterface = TransactionManagerInterface,
  TBase extends OktaAuthConstructor<OktaAuthOAuthInterface<M, S, O, TM>>
    = OktaAuthConstructor<OktaAuthOAuthInterface<M, S, O, TM>>
>
(Base: TBase): TBase & OktaAuthConstructor<OktaAuthCoreInterface<M, S, O, TM>>
{
  return class OktaAuthCore extends Base implements OktaAuthCoreInterface<M, S, O, TM>
  {
    authStateManager: AuthStateManager<M, S, O>;
    serviceManager: ServiceManager<M, S, O>;
    
    constructor(...args: any[]) {
      super(...args);

      // AuthStateManager
      this.authStateManager = new AuthStateManager<M, S, O>(this);

      // ServiceManager
      this.serviceManager = new ServiceManager<M, S, O>(this, this.options.services);
    }

    async start() {
      await this.serviceManager.start();
      // TODO: review tokenManager.start
      this.tokenManager.start();
      if (!this.token.isLoginRedirect()) {
        await this.authStateManager.updateAuthState();
      }
    }
  
    async stop() {
      // TODO: review tokenManager.stop
      this.tokenManager.stop();
      await this.serviceManager.stop();
    }

    async handleRedirect(originalUri?: string): Promise<void> {
      await this.handleLoginRedirect(undefined, originalUri);
    }

    // eslint-disable-next-line complexity
    async handleLoginRedirect(tokens?: Tokens, originalUri?: string): Promise<void> {
      let state = this.options.state;
  
      // Store tokens and update AuthState by the emitted events
      if (tokens) {
        this.tokenManager.setTokens(tokens);
        originalUri = originalUri || this.getOriginalUri(this.options.state);
      } else if (this.isLoginRedirect()) {
        try {
          // For redirect flow, get state from the URL and use it to retrieve the originalUri
          const oAuthResponse = await parseOAuthResponseFromUrl(this, {});
          state = oAuthResponse.state;
          originalUri = originalUri || this.getOriginalUri(state);
          await this.storeTokensFromRedirect();
        } catch(e) {
          // auth state should be updated
          await this.authStateManager.updateAuthState();
          throw e;
        }
      } else {
        return; // nothing to do
      }
      
      // ensure auth state has been updated
      await this.authStateManager.updateAuthState();
  
      // clear originalUri from storage
      this.removeOriginalUri(state);
  
      // Redirect to originalUri
      const { restoreOriginalUri } = this.options;
      if (restoreOriginalUri) {
        await restoreOriginalUri(this, originalUri);
      } else if (originalUri) {
        window.location.replace(originalUri);
      }
    }
  };
}
