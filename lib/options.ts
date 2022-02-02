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


/* eslint-disable complexity */
import { removeTrailingSlash, warn, removeNils } from './util';
import { assertValidConfig } from './builderUtil';
import { OktaAuthOptions, StorageManagerOptions } from './types';

import fetchRequest from './fetch/fetchRequest';
import browserStorage from './browser/browserStorage';
import serverStorage from './server/serverStorage';
import { isBrowser, isHTTPS } from './features';

const BROWSER_STORAGE: StorageManagerOptions = {
  token: {
    storageTypes: [
      'localStorage',
      'sessionStorage',
      'cookie'
    ]
  },
  cache: {
    storageTypes: [
      'localStorage',
      'sessionStorage',
      'cookie'
    ]
  },
  transaction: {
    storageTypes: [
      'sessionStorage',
      'localStorage',
      'cookie'
    ]
  },
  'shared-transaction': {
    storageTypes: [
      'localStorage'
    ]
  },
  'original-uri': {
    storageTypes: [
      'localStorage'
    ]
  }
};

const SERVER_STORAGE: StorageManagerOptions = {
  token: {
    storageTypes: [
      'memory'
    ]
  },
  cache: {
    storageTypes: [
      'memory'
    ]
  },
  transaction: {
    storageTypes: [
      'memory'
    ]
  }
};

function getCookieSettings(args: OktaAuthOptions = {}, isHTTPS: boolean) {
  // Secure cookies will be automatically used on a HTTPS connection
  // Non-secure cookies will be automatically used on a HTTP connection
  // secure option can override the automatic behavior
  var cookieSettings = args.cookies || {};
  if (typeof cookieSettings.secure === 'undefined') {
    cookieSettings.secure = isHTTPS;
  }
  if (typeof cookieSettings.sameSite === 'undefined') {
    cookieSettings.sameSite = cookieSettings.secure ? 'none' : 'lax';
  }

  // If secure=true, but the connection is not HTTPS, set secure=false.
  if (cookieSettings.secure && !isHTTPS) {
    // eslint-disable-next-line no-console
    warn(
      'The current page is not being served with the HTTPS protocol.\n' +
      'For security reasons, we strongly recommend using HTTPS.\n' +
      'If you cannot use HTTPS, set "cookies.secure" option to false.'
    );
    cookieSettings.secure = false;
  }

  // Chrome >= 80 will block cookies with SameSite=None unless they are also Secure
  // If sameSite=none, but the connection is not HTTPS, set sameSite=lax.
  if (cookieSettings.sameSite === 'none' && !cookieSettings.secure) {
    cookieSettings.sameSite = 'lax';
  }

  return cookieSettings;
}


export function getDefaultOptions(): OktaAuthOptions {
  let storageUtil;
  if (isBrowser()) {
    storageUtil = Object.assign({}, browserStorage, {
      inMemoryStore: {} // create unique storage for this instance
    });
  } else {
    storageUtil = serverStorage;
  }
  const storageManager = isBrowser() ? BROWSER_STORAGE : SERVER_STORAGE;
  const enableSharedStorage = isBrowser() ? true : false; // localStorage for multi-tab flows (browser only)
  return {
    devMode: false,
    httpRequestClient: fetchRequest,
    storageUtil,
    storageManager,
    transactionManager: {
      enableSharedStorage
    }
  };
}

function mergeOptions(options, args): OktaAuthOptions {
  return Object.assign({}, options, removeNils(args), {
    storageManager: Object.assign({}, options.storageManager, args.storageManager),
    transactionManager: Object.assign({}, options.transactionManager, args.transactionManager),
  });
}

export function buildOptions(args: OktaAuthOptions = {}): OktaAuthOptions {
  assertValidConfig(args);
  args = mergeOptions(getDefaultOptions(), args);
  return removeNils({
    // OIDC configuration
    issuer: removeTrailingSlash(args.issuer),
    tokenUrl: removeTrailingSlash(args.tokenUrl),
    authorizeUrl: removeTrailingSlash(args.authorizeUrl),
    userinfoUrl: removeTrailingSlash(args.userinfoUrl),
    revokeUrl: removeTrailingSlash(args.revokeUrl),
    logoutUrl: removeTrailingSlash(args.logoutUrl),
    clientId: args.clientId,
    redirectUri: args.redirectUri,
    state: args.state,
    scopes: args.scopes,
    postLogoutRedirectUri: args.postLogoutRedirectUri,
    responseMode: args.responseMode,
    responseType: args.responseType,
    pkce: args.pkce === false ? false : true, // PKCE defaults to true
    useInteractionCodeFlow: args.useInteractionCodeFlow,

    // Internal options
    httpRequestClient: args.httpRequestClient,
    transformErrorXHR: args.transformErrorXHR,
    transformAuthState: args.transformAuthState,
    restoreOriginalUri: args.restoreOriginalUri,
    storageUtil: args.storageUtil,
    headers: args.headers,
    devMode: !!args.devMode,
    storageManager: args.storageManager,
    transactionManager: args.transactionManager,
    cookies: isBrowser() ? getCookieSettings(args, isHTTPS()) : args.cookies,
    flow: args.flow,
    codeChallenge: args.codeChallenge,
    codeChallengeMethod: args.codeChallengeMethod,
    recoveryToken: args.recoveryToken,
    activationToken: args.activationToken,
    
    // Give the developer the ability to disable token signature validation.
    ignoreSignature: !!args.ignoreSignature,

    // Server-side web applications
    clientSecret: args.clientSecret
  });
}
