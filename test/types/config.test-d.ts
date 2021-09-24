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
 *
 */
import {
  OktaAuth,
  OktaAuthOptions,
  toRelativeUrl
} from '@okta/okta-auth-js';
import { expectType } from 'tsd';

// Custom storage provider
const myMemoryStore = {};
const storageProvider = {
  getItem: function(key) {
    // custom get
    return myMemoryStore[key];
  },
  setItem: function(key, val) {
    // custom set
    myMemoryStore[key] = val;
  },
  // optional
  removeItem: function(key) {
    delete myMemoryStore[key];
  }
};

// Config
const config: OktaAuthOptions = {
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: 'GHtf9iJdr60A9IYrR0jw',
  redirectUri: 'https://acme.com/oauth2/callback/home',
  postLogoutRedirectUri: `${window.location.origin}/logout/callback`,

  responseMode: 'query',
  responseType: 'code',
  pkce: false,
  authorizeUrl: 'https://{yourOktaDomain}/oauth2/v1/authorize',
  userinfoUrl: 'https://{yourOktaDomain}/oauth2/v1/userinfo',
  tokenUrl: 'https://{yourOktaDomain}/oauth2/v1/userinfo',
  ignoreSignature: true,
  ignoreLifetime: true,
  maxClockSkew: 10,

  storageManager: {
    token: {
      storageType: 'sessionStorage',
      useMultipleCookies: true // puts each token in its own cookie
    },
    cache: {
      storageTypes: [
        'localStorage',
        'sessionStorage',
        'cookie'
      ]
    },
    transaction: {
      storageProvider: storageProvider
    }
  },
  
  tokenManager: {
    storage: storageProvider,
    storageKey: 'key',
    autoRenew: false,
    autoRemove: false,
    secure: true,
    expireEarlySeconds: 120,
  },

  cookies: {
    secure: true,
    sameSite: 'none'
  },
  devMode: true,

  transformAuthState: async (oktaAuth, authState) => {
    if (!authState.isAuthenticated) {
      return authState;
    }
    const user = await oktaAuth.token.getUserInfo();
    authState.isAuthenticated = !!user;
    authState.user = user;
    return authState;
  },
  restoreOriginalUri: async (oktaAuth, originalUri) => {
    window.location.href = toRelativeUrl(originalUri, window.location.origin);
  },
  httpRequestClient: function(method, url, args) {
    return Promise.resolve(null);
  }
};

// Config with some alternative option types
const config2: OktaAuthOptions = {
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  tokenManager: {
    storage: 'cookie',
  },
  responseType: ['id_token'],
};

// OktaAuth
const authClient = new OktaAuth(config);
expectType<OktaAuth>(authClient);
const authClient2 = new OktaAuth(config2);
expectType<OktaAuth>(authClient2);

