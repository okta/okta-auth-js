import { CALLBACK_PATH, STORAGE_KEY } from './constants';
const HOST = window.location.host;
const PROTO = window.location.protocol;
const REDIRECT_URI = `${PROTO}//${HOST}${CALLBACK_PATH}`;
const POST_LOGOUT_REDIRECT_URI = `${PROTO}//${HOST}`;

function getDefaultConfig() {
  const ISSUER = process.env.ISSUER;
  const CLIENT_ID = process.env.CLIENT_ID;
  
  return {
    redirectUri: REDIRECT_URI,
    postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI,
    issuer: ISSUER,
    clientId: CLIENT_ID,
    responseType: ['token', 'id_token'],
    pkce: true,
    cookies: {
      secure: true
    }
  };
}

// eslint-disable-next-line complexity
function getConfigFromUrl() {
  const url = new URL(window.location.href);
  const issuer = url.searchParams.get('issuer');
  const redirectUri = url.searchParams.get('redirectUri') || REDIRECT_URI;
  const postLogoutRedirectUri = url.searchParams.get('postLogoutRedirectUri') || POST_LOGOUT_REDIRECT_URI;
  const clientId = url.searchParams.get('clientId');
  const pkce = url.searchParams.get('pkce') !== 'false'; // On by default
  const scopes = (url.searchParams.get('scopes') || 'openid,email').split(',');
  const responseType = (url.searchParams.get('responseType') || 'id_token,token').split(',');
  const responseMode = url.searchParams.get('responseMode') || undefined;
  const storage = url.searchParams.get('storage') || undefined;
  const secureCookies = url.searchParams.get('secure') !== 'false'; // On by default
  const sameSite = url.searchParams.get('sameSite') || undefined;

  return {
    redirectUri,
    postLogoutRedirectUri,
    issuer,
    clientId,
    pkce,
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
  };
}

function saveConfigToStorage(config) {
  const configCopy = {};
  Object.keys(config).forEach(key => {
    if (typeof config[key] !== 'function') {
      configCopy[key] = config[key];
    }
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configCopy));
}

function getConfigFromStorage() {
  const config = JSON.parse(localStorage.getItem(STORAGE_KEY));
  return config;
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

function flattenConfig(config) {
  let flat = {};
  Object.assign(flat, config.tokenManager);
  Object.assign(flat, config.cookies);
  Object.keys(config).forEach(key => {
    if (key !== 'tokenManager' && key !== 'cookies') {
      flat[key] = config[key];
    }
  });
  return flat;
}

export { getDefaultConfig, getConfigFromUrl, saveConfigToStorage, getConfigFromStorage, clearStorage, flattenConfig };
