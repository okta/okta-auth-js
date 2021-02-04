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
import { OktaAuth } from '../../types';

export function hasTokensInHash(hash: string): boolean {
  return /((id|access)_token=)/i.test(hash);
}

export function hasCodeInUrl(hashOrSearch: string): boolean {
  return /(code=)/i.test(hashOrSearch);
}

export function hasErrorInUrl(hashOrSearch: string): boolean {
  return /(error=)/i.test(hashOrSearch) || /(error_description)/i.test(hashOrSearch);
}

export function isRedirectUri(uri: string, sdk: OktaAuth): boolean {
  var authParams = sdk.options;
  return uri && uri.indexOf(authParams.redirectUri) === 0;
}

/**
 * Check if tokens or a code have been passed back into the url, which happens in
 * the OIDC (including social auth IDP) redirect flow.
 */
export function isLoginRedirect (sdk: OktaAuth) {
  // First check, is this a redirect URI?
  if (!isRedirectUri(window.location.href, sdk)){
    return false;
  }

  // The location contains either a code, token, or an error&error_description
  var authParams = sdk.options;
  var codeFlow = authParams.pkce || authParams.responseType === 'code' || authParams.responseMode === 'query';
  var useQuery = codeFlow && authParams.responseMode !== 'fragment';

  if (hasErrorInUrl(useQuery ? window.location.search : window.location.hash)) {
    return true;
  }

  if (codeFlow) {
    var hasCode =  useQuery ? hasCodeInUrl(window.location.search) : hasCodeInUrl(window.location.hash);
    return hasCode;
  }

  // implicit flow, will always be hash fragment
  return hasTokensInHash(window.location.hash);
}