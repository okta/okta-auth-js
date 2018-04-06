/// <reference types="typescript" />
///
/// https://www.typescriptlang.org/docs/handbook/modules.html
/// When exporting a module using export =, TypeScript-specific import module = require("module") must be used to import the module.
///

import * as Q from 'q';

export = OktaAuth.OktaAuth;

declare namespace OktaAuth {

  class OktaAuth {
    readonly token: Token;
    readonly tokenManager: TokenManager;

    constructor(config: Config);

    public signIn(options: Credentials): Q.Promise<Transaction>;

    public signOut(): Q.Promise<any>;

    [fn: string]: any;
  }

  interface Config {
    url?: string;
    clientId?: string,
    redirectUri?: string;
    issuer?: string;
    authorizeUrl?: string;
    userinfoUrl?: string;
  }

  interface Credentials {
    username: string;
    password: string;
  }

  interface Transaction {
    readonly status: string;
    readonly sessionToken: string;

    cancel(): Q.Promise<Transaction>;
  }

  interface OAuthOptions {
    responseType: string | string[];
    sessionToken?: string;
    scopes?: string[];
    responseMode?: string;
  }

  interface Token {
    getWithoutPrompt(oauthOptions: OAuthOptions): Q.Promise<any>;

    getWithPopup(oauthOptions: OAuthOptions): Q.Promise<any>;

    getWithRedirect(oauthOptions?: OAuthOptions): void

    parseFromUrl(): Q.Promise<any>;

    decode(idTokenString: string): string

    refresh(tokenToRefresh: string): Q.Promise<string>;

    getUserInfo(accessTokenObject: string): Q.Promise<any>;

    verify(idTokenObject: string): Q.Promise<any>;
  }

  interface TokenManager {
    /** After receiving an access_token or id_token, add it to the tokenManager to manage token expiration and refresh operations.
     *  When a token is added to the tokenManager, it is automatically refreshed when it expires.
     * @param {string} key Unique key to store the token in the tokenManager. This is used later when you want to get, delete, or refresh the token.
     * @param {string} token Token object that will be added */
    add(key: string, token: string): void;

    /** Get a token that you have previously added to the tokenManager with the given key */
    get(key: string): string;

    /** Remove a token from the tokenManager with the given key. */
    remove(key: string): void;

    /** Remove all tokens from the tokenManager. */
    clear(): void;

    /** Manually refresh a token before it expires. */
    refresh(key: string): void;

    /** Subscribe to an event published by the tokenManager. */
    on(event: 'expired' | 'error' | 'refreshed', callback: Function, context?: any);

    /** Unsubscribe from tokenManager events. If no callback is provided, unsubscribes all listeners from the event. */
    off(event: 'expired' | 'error' | 'refreshed', callback: Function);
  }

}
