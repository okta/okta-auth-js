declare namespace OktaAuth {
  type FingerprintFunction = (options?: object) => Promise<object>;
  interface FingerprintAPI extends FingerprintFunction {
    _getUserAgent: () => string;
  }
}