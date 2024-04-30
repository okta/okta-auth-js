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

import { DEFAULT_MAX_CLOCK_SKEW } from '../../constants';
import { removeTrailingSlash, toAbsoluteUrl } from '../../util/url';
import { isBrowser } from '../../features';
import { createHttpOptionsConstructor } from '../../http/options';
import {
  OAuthResponseMode,
  OAuthResponseType,
  OktaAuthOAuthInterface,
  OktaAuthOAuthOptions,
  SetLocationFunction,
  TokenManagerOptions,
  TransactionManagerOptions
} from '../types';
import { enableSharedStorage } from './node';
import AuthSdkError from '../../errors/AuthSdkError';

function assertValidConfig(args) {
  args = args || {};

  var scopes = args.scopes;
  if (scopes && !Array.isArray(scopes)) {
    throw new AuthSdkError('scopes must be a array of strings. ' +
      'Required usage: new OktaAuth({scopes: ["openid", "email"]})');
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  var issuer = args.issuer!;
  if (!issuer) {
    throw new AuthSdkError('No issuer passed to constructor. ' + 
      'Required usage: new OktaAuth({issuer: "https://{yourOktaDomain}.com/oauth2/{authServerId}"})');
  }

  var isUrlRegex = new RegExp('^http?s?://.+');
  if (!isUrlRegex.test(issuer)) {
    throw new AuthSdkError('Issuer must be a valid URL. ' + 
      'Required usage: new OktaAuth({issuer: "https://{yourOktaDomain}.com/oauth2/{authServerId}"})');
  }

  if (issuer.indexOf('-admin.okta') !== -1) {
    throw new AuthSdkError('Issuer URL passed to constructor contains "-admin" in subdomain. ' +
      'Required usage: new OktaAuth({issuer: "https://{yourOktaDomain}.com})');
  }
}

export function createOAuthOptionsConstructor() {
  const HttpOptionsConstructor = createHttpOptionsConstructor();
  return class OAuthOptionsConstructor
    extends HttpOptionsConstructor
    implements Required<OktaAuthOAuthOptions>
  {
    // CustomUrls
    issuer: string;
    authorizeUrl: string;
    userinfoUrl: string;
    tokenUrl: string;
    revokeUrl: string;
    logoutUrl: string;
    
    // TokenParams
    pkce: boolean;
    clientId: string;
    redirectUri: string;
    responseType: OAuthResponseType | OAuthResponseType[];
    responseMode: OAuthResponseMode;
    state: string;
    scopes: string[];
    ignoreSignature: boolean;
    codeChallenge: string;
    codeChallengeMethod: string;
    acrValues: string;
    maxAge: string | number;
    dpop: boolean;

    // Additional options
    tokenManager: TokenManagerOptions;
    postLogoutRedirectUri: string;
    restoreOriginalUri: (oktaAuth: OktaAuthOAuthInterface, originalUri?: string) => Promise<void>;
    transactionManager: TransactionManagerOptions;

    // For server-side web applications ONLY!
    clientSecret: string;
    setLocation: SetLocationFunction;

    // Workaround for bad client time/clock
    ignoreLifetime: boolean;
    maxClockSkew: number;


    // eslint-disable-next-line max-statements
    constructor(options: any) {
      super(options);
      
      assertValidConfig(options);
      
      this.issuer = removeTrailingSlash(options.issuer);
      this.tokenUrl = removeTrailingSlash(options.tokenUrl);
      this.authorizeUrl = removeTrailingSlash(options.authorizeUrl);
      this.userinfoUrl = removeTrailingSlash(options.userinfoUrl);
      this.revokeUrl = removeTrailingSlash(options.revokeUrl);
      this.logoutUrl = removeTrailingSlash(options.logoutUrl);

      this.pkce = options.pkce === false ? false : true; // PKCE defaults to true
      this.clientId = options.clientId;
      this.redirectUri = options.redirectUri;
      if (isBrowser()) {
        this.redirectUri = toAbsoluteUrl(options.redirectUri, window.location.origin); // allow relative URIs
      }
      this.responseType = options.responseType;
      this.responseMode = options.responseMode;
      this.state = options.state;
      this.scopes = options.scopes;
      // Give the developer the ability to disable token signature validation.
      this.ignoreSignature = !!options.ignoreSignature;
      this.codeChallenge = options.codeChallenge;
      this.codeChallengeMethod = options.codeChallengeMethod;
      this.acrValues = options.acrValues;
      this.maxAge = options.maxAge;
      this.dpop = options.dpop === true; // dpop defaults to false

      this.tokenManager = options.tokenManager;
      this.postLogoutRedirectUri = options.postLogoutRedirectUri;
      this.restoreOriginalUri = options.restoreOriginalUri;
      this.transactionManager = { enableSharedStorage, ...options.transactionManager };
      
      this.clientSecret = options.clientSecret;
      this.setLocation = options.setLocation;
      
      // As some end user's devices can have their date 
      // and time incorrectly set, allow for the disabling
      // of the jwt liftetime validation
      this.ignoreLifetime = !!options.ignoreLifetime;

      // Digital clocks will drift over time, so the server
      // can misalign with the time reported by the browser.
      // The maxClockSkew allows relaxing the time-based
      // validation of tokens (in seconds, not milliseconds).
      // It currently defaults to 300, because 5 min is the
      // default maximum tolerance allowed by Kerberos.
      // (https://technet.microsoft.com/en-us/library/cc976357.aspx)
      if (!options.maxClockSkew && options.maxClockSkew !== 0) {
        this.maxClockSkew = DEFAULT_MAX_CLOCK_SKEW;
      } else {
        this.maxClockSkew = options.maxClockSkew;
      }

    }
  };
}
