
declare namespace OktaAuth {
  interface SdkClock {
    now?: () => number;
  }

  interface TokenManagerRef {
    options: TokenManagerOptions;
    emitter: EventEmitter;
    clock: SdkClock;
    expireTimeouts: object;
    renewPromise?: any;
  }

  interface TokenManagerAPI extends EventSource {
    get(key: string): Promise<any>;
    add(key: string, token: Token): void;
    clear(): void;
    remove(key: string): void;
    renew(key: string): Promise<any>;
  }
}