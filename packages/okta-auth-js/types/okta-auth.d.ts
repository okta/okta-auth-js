/// <reference path="./options.d.ts" />
/// <reference path="./tx.d.ts" />
/// <reference path="./token-manager.d.ts" />
/// <reference path="./events.d.ts" />
/// <reference path="./token-api.d.ts" />
/// <reference path="./session.d.ts" />
/// <reference path="./events.d.ts" />
/// <reference path="./features.d.ts" />
/// <reference path="./fingerprint.d.ts" />

declare namespace OktaAuth {
  type OktaAuthBuilder = (args: any) => OktaAuthFactory;
  type OktaAuthFactory = (storageUtil: any, httpRequestClient: any) => any;
}

declare class OktaAuth {
  constructor(options?: OktaAuth.OktaAuthOptions);

  // Core interface, implemented by browser & server
  userAgent: string;
  options: OktaAuth.OktaAuthOptions;
  tx: OktaAuth.TransactionAPI;
  session: OktaAuth.SessionAPI;
  signIn(options?: OktaAuth.SigninOptions): Promise<any>;


  // Shared methods, added by builderUtil.addSharedPrototypes
  verifyRecoveryToken(options?: object): Promise<any>;
  unlockAccount(options?: object): Promise<any>;
  forgotPassword(options?: object): Promise<any>;
  getIssuerOrigin(): string;

  // Browser interface
  emitter: OktaAuth.EventEmitter;
  fingerprint: OktaAuth.FingerprintAPI;
  idToken: OktaAuth.IDTokenAPI;
  token: OktaAuth.TokenAPI;
  tokenManager: OktaAuth.TokenManagerAPI;

  // features API is also hoisted to static level
  static features: OktaAuth.FeaturesAPI;
  features: OktaAuth.FeaturesAPI;

  _onTokenManagerError(error: any): void;
  signOut(options?: OktaAuth.SignoutOptions): Promise<void>;
  webfinger(params?: object): Promise<object>;
  closeSession(): Promise<any>;
  revokeAccessToken(token?: OktaAuth.AccessToken): Promise<any>;
}
