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
/* global window */
/* eslint-disable complexity, max-statements */
import { OktaAuthOAuthOptions, OktaAuthOAuthInterface, OAuthResponseType } from '../types';

export function hasTokensInHash(hash: string): boolean {
  return /((id|access)_token=)/i.test(hash);
}

// authorization_code
export function hasAuthorizationCode(hashOrSearch: string): boolean {
  return /(code=)/i.test(hashOrSearch);
}

// interaction_code
export function hasInteractionCode(hashOrSearch: string): boolean {
  return /(interaction_code=)/i.test(hashOrSearch);
}

export function hasErrorInUrl(hashOrSearch: string): boolean {
  return /(error=)/i.test(hashOrSearch) || /(error_description)/i.test(hashOrSearch);
}

export function isRedirectUri(uri: string, sdk: OktaAuthOAuthInterface): boolean {
  var authParams = sdk.options;
  if (!uri || !authParams.redirectUri) {
    return false;
  }
  return uri.indexOf(authParams.redirectUri) === 0;
}

export function isCodeFlow(options: OktaAuthOAuthOptions) {
  return options.pkce || options.responseType === 'code' || options.responseMode === 'query';
}

export function hasResponseType(responseType: OAuthResponseType, options: OktaAuthOAuthOptions): boolean {
  let hasResponseType = false;
  if (Array.isArray(options.responseType) && options.responseType.length) {
    hasResponseType = options.responseType.indexOf(responseType) >= 0;
  } else {
    hasResponseType = options.responseType === responseType;
  }
  return hasResponseType;
}

export function getHashOrSearch(options: OktaAuthOAuthOptions) {
  var codeFlow = isCodeFlow(options);
  var useQuery = codeFlow && options.responseMode !== 'fragment';
  return useQuery ? window.location.search : window.location.hash;
}

/**
 * Check if tokens or a code have been passed back into the url, which happens in
 * the OIDC (including social auth IDP) redirect flow.
 */
export function isLoginRedirect (sdk: OktaAuthOAuthInterface) {
  // First check, is this a redirect URI?
  if (!isRedirectUri(window.location.href, sdk)){
    return false;
  }

  // The location contains either a code, token, or an error + error_description
  var codeFlow = isCodeFlow(sdk.options);
  var hashOrSearch = getHashOrSearch(sdk.options);

  if (hasErrorInUrl(hashOrSearch)) {
    return true;
  }

  if (codeFlow) {
    var hasCode =  hasAuthorizationCode(hashOrSearch) || hasInteractionCode(hashOrSearch);
    return hasCode;
  }

  // implicit flow, will always be hash fragment
  return hasTokensInHash(window.location.hash);
}

/**
 * Check if error=interaction_required has been passed back in the url, which happens in
 * the social auth IDP redirect flow.
 */
export function isInteractionRequired (sdk: OktaAuthOAuthInterface, hashOrSearch?: string) {
  if (!hashOrSearch) { // web only
    // First check, is this a redirect URI?
    if (!isLoginRedirect(sdk)){
      return false;
    }
  
    hashOrSearch = getHashOrSearch(sdk.options);
  }
  return /(error=interaction_required)/i.test(hashOrSearch);
}