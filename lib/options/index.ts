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

import { removeTrailingSlash, removeNils } from '../util';
import { assertValidConfig } from '../builderUtil';
import { OktaAuthOptions } from '../types';

import fetchRequest from '../fetch/fetchRequest';
import { getStorage, STORAGE_MANAGER_OPTIONS, enableSharedStorage, getCookieSettings } from './node';
import { isHTTPS } from '../features';

export function getDefaultOptions(): OktaAuthOptions {

  
  const options = {
    devMode: false,
    httpRequestClient: fetchRequest,
    storageUtil: getStorage(),
    storageManager: STORAGE_MANAGER_OPTIONS,
    transactionManager: {
      enableSharedStorage
    }
  };
  return options;
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
    cookies: getCookieSettings(args, isHTTPS()),
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
