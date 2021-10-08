/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


import { OktaAuthOptions } from '@okta/okta-auth-js';
import { CALLBACK_PATH, STORAGE_KEY } from './constants';
const HOST = window.location.host;
const PROTO = window.location.protocol;
const REDIRECT_URI = `${PROTO}//${HOST}${CALLBACK_PATH}`;
const POST_LOGOUT_REDIRECT_URI = `${PROTO}//${HOST}/`;
const DEFAULT_SIW_VERSION = ''; // blank for local/npm/bundled version

export interface Config extends OktaAuthOptions {
  defaultScopes: boolean;
  siwVersion: string;
  siwAuthClient:  boolean;
  idps: string;
  clientSecret: string;
  forceRedirect: boolean;
  useInteractionCodeFlow: boolean; // widget option
  enableSharedStorage: boolean; // TransactionManager
}

export function getDefaultConfig(): Config {
  const ISSUER = process.env.ISSUER;
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET || '';

  return {
    forceRedirect: false,
    siwVersion: DEFAULT_SIW_VERSION,
    siwAuthClient: false,
    idps: '',
    redirectUri: REDIRECT_URI,
    postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI,
    issuer: ISSUER,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    responseType: ['token', 'id_token'],
    scopes: ['openid', 'email', 'offline_access'],
    defaultScopes: false,
    pkce: true,
    cookies: {
      secure: true
    },
    useInteractionCodeFlow: false,
    enableSharedStorage: true
  };
}

// eslint-disable-next-line complexity
export function getConfigFromUrl(): Config {
  const url = new URL(window.location.href);
  const issuer = url.searchParams.get('issuer');
  const redirectUri = url.searchParams.get('redirectUri') || REDIRECT_URI;
  const postLogoutRedirectUri = url.searchParams.get('postLogoutRedirectUri') || POST_LOGOUT_REDIRECT_URI;
  const clientId = url.searchParams.get('clientId');
  const clientSecret = url.searchParams.get('clientSecret');
  const pkce = url.searchParams.get('pkce') !== 'false'; // On by default
  const defaultScopes = url.searchParams.get('defaultScopes') === 'true';
  const scopes = (url.searchParams.get('scopes') || 'openid,email,offline_access').split(',');
  const responseType = (url.searchParams.get('responseType') || 'id_token,token').split(',');
  const responseMode = url.searchParams.get('responseMode') || undefined;
  const storage = url.searchParams.get('storage') || undefined;
  const expireEarlySeconds = +url.searchParams.get('expireEarlySeconds') || undefined;
  const secureCookies = url.searchParams.get('secure') !== 'false'; // On by default
  const sameSite = url.searchParams.get('sameSite') || undefined;
  const siwVersion = url.searchParams.get('siwVersion') || DEFAULT_SIW_VERSION;
  const siwAuthClient = url.searchParams.get('siwAuthClient') === 'true'; // off by default
  const idps = url.searchParams.get('idps') || '';
  const useInteractionCodeFlow = url.searchParams.get('useInteractionCodeFlow') === 'true'; // off by default
  const forceRedirect = url.searchParams.get('forceRedirect') === 'true'; // off by default
  const enableSharedStorage = url.searchParams.get('enableSharedStorage') !== 'false'; // on by default

  return {
    forceRedirect,
    siwVersion,
    siwAuthClient,
    idps,
    enableSharedStorage,
    redirectUri,
    postLogoutRedirectUri,
    issuer,
    clientId,
    clientSecret,
    pkce,
    defaultScopes,
    scopes,
    responseType,
    responseMode,
    cookies: {
      secure: secureCookies,
      sameSite
    },
    tokenManager: {
      storage,
      expireEarlySeconds
    },
    transactionManager: {
      enableSharedStorage
    },
    useInteractionCodeFlow
  };
}

export function saveConfigToStorage(config: Config): void {
  const configCopy: any = {};
  Object.keys(config).forEach(key => {
    if (typeof (config as any)[key] !== 'function') {
      configCopy[key] = (config as any)[key];
    }
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configCopy));
}

export function getConfigFromStorage(): Config {
  const config = JSON.parse(localStorage.getItem(STORAGE_KEY));
  return config;
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function flattenConfig(config: Config): any {
  const flat: Record<string, any> = {};
  Object.assign(flat, config.tokenManager);
  Object.assign(flat, config.cookies);
  Object.assign(flat, config.transactionManager);
  Object.keys(config).forEach(key => {
    if (key !== 'tokenManager' && key !== 'cookies' && key !== 'transactionManager') {
      (flat as any)[key] = (config as any)[key];
    }
  });
  return flat;
}
