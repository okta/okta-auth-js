export interface CryptoAPI {
  base64UrlToBuffer(b64u: string): Uint8Array;
  bufferToBase64Url(bin: Uint8Array): string;
}
