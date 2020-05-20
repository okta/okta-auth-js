declare namespace OktaAuth {
  interface FeaturesAPI {
    isLocalhost(): boolean;
    isHTTPS(): boolean;
    isFingerprintSupported(): boolean;
    isPopupPostMessageSupported(): boolean;
    hasTextEncoder(): boolean;
    isTokenVerifySupported(): boolean;
    isPKCESupported(): boolean;
  }
}