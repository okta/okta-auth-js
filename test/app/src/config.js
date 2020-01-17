/* global window, URL, localStorage, process */
import { CALLBACK_PATH, STORAGE_KEY } from './constants';
const HOST = window.location.host;
const PROTO = window.location.protocol;
const REDIRECT_URI = `${PROTO}//${HOST}${CALLBACK_PATH}`;

function getDefaultConfig() {
  const ISSUER = process.env.ISSUER;
  const CLIENT_ID = process.env.CLIENT_ID;
  
  return {
    redirectUri: REDIRECT_URI,
    issuer: ISSUER,
    clientId: CLIENT_ID,
    pkce: true,
  };
}

function getConfigFromUrl() {
  const url = new URL(window.location.href);
  const issuer = url.searchParams.get('issuer');
  const clientId = url.searchParams.get('clientId');
  const pkce = url.searchParams.get('pkce') && url.searchParams.get('pkce') !== 'false';
  const scopes = (url.searchParams.get('scopes') || 'openid,email').split(',');
  const responseType = (url.searchParams.get('responseType') || 'id_token,token').split(',');
  const storage = url.searchParams.get('storage') || undefined;
  const secure = url.searchParams.get('secure') === 'on'; // currently opt-in.
  return {
    redirectUri: REDIRECT_URI,
    issuer,
    clientId,
    pkce,
    scopes,
    responseType,
    tokenManager: {
      storage,
      secure,
    },
  };
}

function saveConfigToStorage(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
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
  Object.keys(config).forEach(key => {
    if (key !== 'tokenManager') {
      flat[key] = config[key];
    }
  });
  return flat;
}

export { getDefaultConfig, getConfigFromUrl, saveConfigToStorage, getConfigFromStorage, clearStorage, flattenConfig };
