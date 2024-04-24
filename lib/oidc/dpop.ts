// References:
// https://www.w3.org/TR/WebCryptoAPI/#concepts-key-storage
// https://datatracker.ietf.org/doc/html/rfc9449

import {
  webcrypto,
  stringToBase64Url,
  stringToBuffer,
  bufferToBase64Url,
  base64ToBase64Url,
  btoa
} from '../crypto';
import { AuthSdkError, OAuthError, WWWAuthError, isOAuthError, isWWWAuthError } from '../errors';
import { Tokens } from './types';

export interface DPoPClaims {
  htm: string;
  htu: string;
  iat: number;
  jti: string;
  nonce?: string;
  ath?: string;
}

export interface DPoPProofParams {
  keyPair: CryptoKeyPair;
  url: string;
  method: string;
  nonce?: string;
  accessToken?: string;
}

export type ResourceDPoPProofParams = Omit<DPoPProofParams, 'keyPair' | 'nonce'>;
type DPoPProofTokenRequestParams = Omit<DPoPProofParams, 'accessToken'>;

const INDEXEDDB_NAME = 'OktaAuthJs';
const DB_KEY = 'DPoPKeys';

export function isDPoPNonceError(obj: any): obj is OAuthError | WWWAuthError {
  return (
    (isOAuthError(obj) || isWWWAuthError(obj)) &&
    obj.errorCode === 'use_dpop_nonce'
  );
}

/////////// crypto ///////////

export async function createJwt(header: object, claims: object, signingKey: CryptoKey): Promise<string> {
  const head = stringToBase64Url(JSON.stringify(header));
  const body = stringToBase64Url(JSON.stringify(claims));
  const signature = await webcrypto.subtle.sign(
    { name: signingKey.algorithm.name }, signingKey, stringToBuffer(`${head}.${body}`)
  );
  return `${head}.${body}.${base64ToBase64Url(bufferToBase64Url(signature))}`;
}

export function cryptoRandomValue (byteLen = 32) {
  return [...webcrypto.getRandomValues(new Uint8Array(byteLen))].map(v => v.toString(16)).join('');
}

export async function generateKeyPair (): Promise<CryptoKeyPair> {
  const algorithm = {
    name: 'RSASSA-PKCS1-v1_5',
    hash: 'SHA-256',
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
  };

  // The "false" here makes it non-exportable
  // https://caniuse.com/mdn-api_subtlecrypto_generatekey
  return webcrypto.subtle.generateKey(algorithm, false, ['sign', 'verify']);
}

async function hashAccessToken (accessToken: string): Promise<string> {
  const buffer = new TextEncoder().encode(accessToken);
  const hash = await webcrypto.subtle.digest('SHA-256', buffer);

  return btoa(String.fromCharCode.apply(null, new Uint8Array(hash) as unknown as number[]))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/////////// indexeddb / keystore ///////////


// https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore#instance_methods
// add additional methods as needed
export type StoreMethod = 'get' | 'add' | 'delete' | 'clear';

// convenience abstraction for exposing IDBObjectStore instance
function keyStore (): Promise<IDBObjectStore> {
  return new Promise((resolve, reject) => {
    try {
      const indexedDB = window.indexedDB;
      const req = indexedDB.open(INDEXEDDB_NAME, 1);

      req.onerror = function () {
        reject(req.error!);
      };

      req.onupgradeneeded = function () {
        const db = req.result;
        db.createObjectStore(DB_KEY);
      };

      req.onsuccess = function () {
        const db = req.result;
        const tx = db.transaction(DB_KEY, 'readwrite');

        tx.onerror = function () {
          reject(tx.error!);
        };

        const store = tx.objectStore(DB_KEY);

        resolve(store);

        tx.oncomplete = function () {
          db.close();
        };
      };
    }
    catch (err) {
      reject(err);
    }
  });
}

// convenience abstraction for wrapping IDBObjectStore methods in promises
async function invokeStoreMethod (method: StoreMethod, ...args: any[]): Promise<IDBRequest> {
  const store = await keyStore();
  return new Promise((resolve, reject) => {
    // https://github.com/microsoft/TypeScript/issues/49700
    // https://github.com/microsoft/TypeScript/issues/49802
    // @ts-expect-error ts(2556)
    const req = store[method](...args);
    req.onsuccess = function () {
      resolve(req);
    };
    req.onerror = function () {
      reject(req.error);
    };
  });
}

async function storeKeyPair (pairId: string, keyPair: CryptoKeyPair) {
  await invokeStoreMethod('add', keyPair, pairId);
  return keyPair;
}

// attempts to find keyPair stored at given key, otherwise throws
export async function findKeyPair (pairId?: string): Promise<CryptoKeyPair> {
  if (pairId) {
    const req = await invokeStoreMethod('get', pairId);
    if (req.result) {
      return req.result;
    }
  }

  // defaults to throwing unless keyPair is found
  throw new AuthSdkError(`Unable to locate dpop key pair required for refresh${pairId ? ` (${pairId})` : ''}`);
}

export async function clearDPoPKeyPair (pairId: string): Promise<void> {
  await invokeStoreMethod('delete', pairId);
}

export async function clearAllDPoPKeyPairs (): Promise<void> {
  await invokeStoreMethod('clear');
}

// generates a crypto (non-extractable) private key pair and writes it to indexeddb, returns key (id)
export async function createDPoPKeyPair (): Promise<{keyPair: CryptoKeyPair, keyPairId: string}> {
  const keyPairId = cryptoRandomValue(4);
  const keyPair = await generateKeyPair();
  await storeKeyPair(keyPairId, keyPair);
  return { keyPair, keyPairId };
}

// will clear PK from storage if certain token conditions are met
/* eslint max-len: [2, 132], complexity: [2, 12] */
export async function clearDPoPKeyPairAfterRevoke (revokedToken: 'access' | 'refresh', tokens: Tokens): Promise<void> {
  let shouldClear = false;

  const { accessToken, refreshToken } = tokens;

  // revoking access token and refresh token doesn't exist
  if (revokedToken === 'access' && accessToken && accessToken.tokenType === 'DPoP' && !refreshToken) {
    shouldClear = true;
  }

  // revoking refresh token and access token doesn't exist
  if (revokedToken === 'refresh' && refreshToken && !accessToken) {
    shouldClear = true;
  }

  const pairId = accessToken?.dpopPairId ?? refreshToken?.dpopPairId;
  if (shouldClear && pairId) {
    await clearDPoPKeyPair(pairId);
  }
}

/////////// proof generation methods ///////////

export async function generateDPoPProof ({ keyPair, url, method, nonce, accessToken }: DPoPProofParams): Promise<string> {
  const { kty, crv, e, n, x, y } = await webcrypto.subtle.exportKey('jwk', keyPair.publicKey);
  const header = {
    alg: 'RS256',
    typ: 'dpop+jwt',
    jwk: { kty, crv, e, n, x, y }
  };

  const claims: DPoPClaims = {
    htm: method,
    htu: url,
    iat: Math.floor(Date.now() / 1000),
    jti: cryptoRandomValue(),
  };

  if (nonce) {
    claims.nonce = nonce;
  }

  // encode access token
  if (accessToken) {
    claims.ath = await hashAccessToken(accessToken);
  }

  return createJwt(header, claims, keyPair.privateKey);
}

/* eslint max-len: [2, 132] */
export async function generateDPoPForTokenRequest ({ keyPair, url, method, nonce }: DPoPProofTokenRequestParams): Promise<string> {
  const params: DPoPProofParams = { keyPair, url, method };
  if (nonce) {
    params.nonce = nonce;
  }

  return generateDPoPProof(params);
}
