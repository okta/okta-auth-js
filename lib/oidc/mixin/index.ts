import { OktaAuthConstructor } from '../../base/types';
import { 
  PromiseQueue,
} from '../../util';
import { CryptoAPI } from '../../crypto/types';
import * as crypto from '../../crypto';
import {
  OAuthResponseType,
  OAuthStorageManagerInterface,
  OAuthTransactionMeta,
  OktaAuthOAuthInterface,
  OktaAuthOAuthOptions,
  PkceAPI,
  PKCETransactionMeta,
  SigninWithRedirectOptions,
  TokenAPI,
  TransactionManagerInterface,
  TransactionManagerConstructor,
} from '../types';
import PKCE from '../util/pkce';
import { createTokenAPI } from '../factory';
import { isLoginRedirect } from '../util';

import { OktaAuthSessionInterface } from '../../session/types';
import { provideOriginalUri } from './node';
export function mixinOAuth
<
  M extends OAuthTransactionMeta = PKCETransactionMeta,
  S extends OAuthStorageManagerInterface<M> = OAuthStorageManagerInterface<M>,
  O extends OktaAuthOAuthOptions = OktaAuthOAuthOptions,
  TM extends TransactionManagerInterface = TransactionManagerInterface,
  TBase extends OktaAuthConstructor<OktaAuthSessionInterface<S, O>>
    = OktaAuthConstructor<OktaAuthSessionInterface<S, O>>
>
(
  Base: TBase,
  TransactionManagerConstructor: TransactionManagerConstructor<TM>,
): TBase & OktaAuthConstructor<OktaAuthOAuthInterface<M, S, O, TM>>
{
  const WithOriginalUri = provideOriginalUri(Base);
  return class OktaAuthOAuth extends WithOriginalUri
  implements OktaAuthOAuthInterface<M, S, O, TM>
  {
    static crypto: CryptoAPI = crypto;
    token: TokenAPI;
    transactionManager: TM;
    pkce: PkceAPI;

    _pending: { handleLogin: boolean };
    _tokenQueue: PromiseQueue;
    
    constructor(...args: any[]) {
      super(...args);

      this.transactionManager = new TransactionManagerConstructor(Object.assign({
        storageManager: this.storageManager,
      }, this.options.transactionManager));
  
      this.pkce = {
        DEFAULT_CODE_CHALLENGE_METHOD: PKCE.DEFAULT_CODE_CHALLENGE_METHOD,
        generateVerifier: PKCE.generateVerifier,
        computeChallenge: PKCE.computeChallenge
      };
  
      this._pending = { handleLogin: false };

      this._tokenQueue = new PromiseQueue();

      this.token = createTokenAPI(this, this._tokenQueue);
    }

    async signInWithRedirect(opts: SigninWithRedirectOptions = {}) {
      const { originalUri, ...additionalParams } = opts;
      if(this._pending.handleLogin) { 
        // Don't trigger second round
        return;
      }

      this._pending.handleLogin = true;
      try {
        // Trigger default signIn redirect flow
        if (originalUri) {
          this.setOriginalUri(originalUri);
        }
        const params = Object.assign({
          // TODO: remove this line when default scopes are changed OKTA-343294
          scopes: this.options.scopes || ['openid', 'email', 'profile']
        }, additionalParams);
        await this.token.getWithRedirect(params);
      } finally {
        this._pending.handleLogin = false;
      }
    }
  
    isLoginRedirect(): boolean {
      return isLoginRedirect(this);
    }

    isPKCE(): boolean {
      return !!this.options.pkce;
    }
  
    hasResponseType(responseType: OAuthResponseType): boolean {
      let hasResponseType = false;
      if (Array.isArray(this.options.responseType) && this.options.responseType.length) {
        hasResponseType = this.options.responseType.indexOf(responseType) >= 0;
      } else {
        hasResponseType = this.options.responseType === responseType;
      }
      return hasResponseType;
    }
  
    isAuthorizationCodeFlow(): boolean {
      return this.hasResponseType('code');
    }

  };

}
