import { OktaAuthOptions } from '@okta/okta-auth-js';
import { CALLBACK_PATH, STORAGE_KEY } from './constants';
const HOST = window.location.host;
const PROTO = window.location.protocol;
const REDIRECT_URI = `${PROTO}//${HOST}${CALLBACK_PATH}`;
const POST_LOGOUT_REDIRECT_URI = `${PROTO}//${HOST}/`;
const DEFAULT_SIW_VERSION = ''; // blank for local/npm/bundled version

export interface Config extends OktaAuthOptions {
  _defaultScopes: boolean;
  _siwVersion: string;
  _idps: string;
  _clientSecret: string;
  _forceRedirect: boolean;
  useInteractionCodeFlow: boolean; // widget option
}

function getDefaultConfig(): Config {
  const ISSUER = process.env.ISSUER;
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET || '';

  return {
    _forceRedirect: false,
    _siwVersion: DEFAULT_SIW_VERSION,
    _idps: '',
    redirectUri: REDIRECT_URI,
    postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI,
    issuer: ISSUER,
    clientId: CLIENT_ID,
    _clientSecret: CLIENT_SECRET,
    responseType: ['token', 'id_token'],
    scopes: ['openid', 'email', 'offline_access'],
    _defaultScopes: false,
    pkce: true,
    cookies: {
      secure: true
    },
    useInteractionCodeFlow: false
  };
}

// eslint-disable-next-line complexity
function getConfigFromUrl(): Config {
  const url = new URL(window.location.href);
  const issuer = url.searchParams.get('issuer');
  const redirectUri = url.searchParams.get('redirectUri') || REDIRECT_URI;
  const postLogoutRedirectUri = url.searchParams.get('postLogoutRedirectUri') || POST_LOGOUT_REDIRECT_URI;
  const clientId = url.searchParams.get('clientId');
  const _clientSecret = url.searchParams.get('_clientSecret');
  const pkce = url.searchParams.get('pkce') !== 'false'; // On by default
  const _defaultScopes = url.searchParams.get('_defaultScopes') === 'true';
  const scopes = (url.searchParams.get('scopes') || 'openid,email,offline_access').split(',');
  const responseType = (url.searchParams.get('responseType') || 'id_token,token').split(',');
  const responseMode = url.searchParams.get('responseMode') || undefined;
  const storage = url.searchParams.get('storage') || undefined;
  const secureCookies = url.searchParams.get('secure') !== 'false'; // On by default
  const sameSite = url.searchParams.get('sameSite') || undefined;
  const _siwVersion = url.searchParams.get('_siwVersion') || DEFAULT_SIW_VERSION;
  const _idps = url.searchParams.get('_idps') || '';
  const useInteractionCodeFlow = url.searchParams.get('useInteractionCodeFlow') === 'true'; // off by default
  const _forceRedirect = url.searchParams.get('_forceRedirect') === 'true'; // off by default

  return {
    _forceRedirect,
    _siwVersion,
    _idps,
    redirectUri,
    postLogoutRedirectUri,
    issuer,
    clientId,
    _clientSecret,
    pkce,
    _defaultScopes,
    scopes,
    responseType,
    responseMode,
    cookies: {
      secure: secureCookies,
      sameSite
    },
    tokenManager: {
      storage,
    },
    useInteractionCodeFlow
  };
}

function saveConfigToStorage(config: Config): void {
  const configCopy: any = {};
  Object.keys(config).forEach(key => {
    if (typeof (config as any)[key] !== 'function') {
      configCopy[key] = (config as any)[key];
    }
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configCopy));
}

function getConfigFromStorage(): Config {
  const config = JSON.parse(localStorage.getItem(STORAGE_KEY));
  return config;
}

function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function flattenConfig(config: Config): any {
  const flat: Record<string, any> = {};
  Object.assign(flat, config.tokenManager);
  Object.assign(flat, config.cookies);
  Object.keys(config).forEach(key => {
    if (key !== 'tokenManager' && key !== 'cookies') {
      (flat as any)[key] = (config as any)[key];
    }
  });
  return flat;
}

export { getDefaultConfig, getConfigFromUrl, saveConfigToStorage, getConfigFromStorage, clearStorage, flattenConfig };
