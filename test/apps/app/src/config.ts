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


import { OAuthResponseMode, OAuthResponseType, OktaAuthOptions } from '@okta/okta-auth-js';
import { LOGIN_CALLBACK_PATH, STORAGE_KEY } from './constants';
const HOST = window.location.host;
const PROTO = window.location.protocol;
const REDIRECT_URI = `${PROTO}//${HOST}${LOGIN_CALLBACK_PATH}`;
const POST_LOGOUT_REDIRECT_URI = `${PROTO}//${HOST}/`;
const DEFAULT_SIW_VERSION = ''; // blank for local/npm/bundled version
export const DEFAULT_CROSS_TABS_COUNT = 20;

export interface Config extends OktaAuthOptions {
  defaultScopes: boolean;
  siwVersion: string;
  siwAuthClient:  boolean;
  idps: string;
  clientSecret: string;
  forceRedirect: boolean;
  useInteractionCodeFlow: boolean; // widget option
  enableSharedStorage: boolean; // TransactionManager
  isTokenRenewPage?: boolean; // special lite /renew page to test cross-tab token renew
  crossTabsCount?: number;
  enrollAmrValues?: string[];
}

export function getDefaultConfig(): Config {
  const ISSUER = process.env.ISSUER;
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET || '';

  return {
    issuer: ISSUER,
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    useInteractionCodeFlow: true,
    responseType: ['token', 'id_token'],
    scopes: ['openid', 'email', 'offline_access'],
    pkce: true,
    dpop: true,
    forceRedirect: false,
    siwVersion: DEFAULT_SIW_VERSION,
    siwAuthClient: false,
    idps: '',
    postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI,
    clientSecret: CLIENT_SECRET,
    defaultScopes: false,
    cookies: {
      secure: true
    },
    enableSharedStorage: true,
    crossTabsCount: DEFAULT_CROSS_TABS_COUNT
  };
}

// eslint-disable-next-line complexity,max-statements
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
  const responseType = (url.searchParams.get('responseType') || 'id_token,token').split(',') as OAuthResponseType[];
  const responseMode = url.searchParams.get('responseMode') as OAuthResponseMode || undefined;
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
  const syncStorage = url.searchParams.get('syncStorage') !== 'false'; // on by default
  const acrValues = url.searchParams.get('acrValues') || undefined;
  const enrollAmrValues = (url.searchParams.get('enrollAmrValues') || '').split(',');
  const dpop = url.searchParams.get('dpop') === 'true'; // off by default
  let crossTabsCount = parseInt(url.searchParams.get('crossTabsCount'));
  if (isNaN(crossTabsCount)) {
    crossTabsCount = DEFAULT_CROSS_TABS_COUNT;
  }

  return {
    issuer,
    clientId,
    redirectUri,
    useInteractionCodeFlow,
    pkce,
    dpop,
    defaultScopes,
    scopes,
    acrValues,
    enrollAmrValues,
    responseType,
    responseMode,
    postLogoutRedirectUri,
    forceRedirect,
    siwVersion,
    siwAuthClient,
    idps,
    enableSharedStorage,
    clientSecret,
    cookies: {
      secure: secureCookies,
      sameSite
    },
    tokenManager: {
      storage,
      expireEarlySeconds,
      syncStorage
    },
    transactionManager: {
      enableSharedStorage
    },
    crossTabsCount
  };
}

export function saveConfigToStorage(config: Config): void {
  const configCopy: any = {};
  if (!config.isTokenRenewPage) {
    Object.keys(config).forEach(key => {
      if (typeof (config as any)[key] !== 'function') {
        configCopy[key] = (config as any)[key];
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configCopy));
  }
}

export function getConfigFromStorage(): Config {
  const storedValue = localStorage.getItem(STORAGE_KEY);
  if (!storedValue) {
    return getDefaultConfig();
  }
  const config = JSON.parse(storedValue);
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
