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
import { expect } from 'tstyche';

// Custom storage provider
const myMemoryStore: Record<string, string> = {};
const storageProvider = {
  getItem: function(key: string): string {
    // custom get
    return myMemoryStore[key];
  },
  setItem: function(key: string, val: string) {
    // custom set
    myMemoryStore[key] = val;
  },
  // optional
  removeItem: function(key: string) {
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
  pollDelay: 500,

  storageManager: {
    token: {
      storageType: 'sessionStorage'
    },
    cache: {
      storageTypes: [
        'localStorage',
        'sessionStorage',
        'cookie',
        'memory',
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
    clearPendingRemoveTokens: false
  },

  cookies: {
    secure: true,
    sameSite: 'none',
    sessionCookie: true,
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
    return Promise.resolve({
      responseText: 'fake',
      status: 200,
      headers: []
    });
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

const configServerSide: OktaAuthOptions = {
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientSecret: 'GHtf9iJdr60A9IYrR0jwGHtf9iJdr60A9IYrR0jw',
  setLocation: function (_: string) {},
};
expect<OktaAuthOptions>().type.toBeAssignable(configServerSide);

const servicesConfig: OktaAuthOptions = {
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  services: {
    autoRenew: true,
    autoRemove: false,
    syncStorage: true,
    syncChannelName: 'tincanphone'
  }
};
expect<OktaAuthOptions>().type.toBeAssignable(servicesConfig);

// OktaAuth
const authClient = new OktaAuth(config);
expect(authClient).type.toEqual<OktaAuth>();
const authClient2 = new OktaAuth(config2);
expect(authClient2).type.toEqual<OktaAuth>();
