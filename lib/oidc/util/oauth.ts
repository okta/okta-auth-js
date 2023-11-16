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
/* eslint-disable complexity, max-statements */
import { genRandomString, removeTrailingSlash } from '../../util';
import AuthSdkError from '../../errors/AuthSdkError';
import { OktaAuthOAuthInterface, CustomUrls } from '../types';

export function generateState() {
  return genRandomString(64);
}

export function generateNonce() {
  return genRandomString(64);
}

function getIssuer(sdk: OktaAuthOAuthInterface, options: CustomUrls = {}) {
  const issuer = removeTrailingSlash(options.issuer) || sdk.options.issuer;
  return issuer;
}

export function getOAuthBaseUrl(sdk: OktaAuthOAuthInterface, options: CustomUrls = {}) {
  const issuer = getIssuer(sdk, options);
  const baseUrl = issuer.indexOf('/oauth2') > 0 ? issuer : issuer + '/oauth2';
  return baseUrl;
}

export function getOAuthDomain(sdk: OktaAuthOAuthInterface, options: CustomUrls = {}) {
  const issuer = getIssuer(sdk, options);
  const domain = issuer.split('/oauth2')[0];
  return domain;
}

export function getOAuthUrls(sdk: OktaAuthOAuthInterface, options?: CustomUrls): CustomUrls {
  if (arguments.length > 2) {
    throw new AuthSdkError('As of version 3.0, "getOAuthUrls" takes only a single set of options');
  }
  options = options || {};

  // Get user-supplied arguments
  var authorizeUrl = removeTrailingSlash(options.authorizeUrl) || sdk.options.authorizeUrl;
  var issuer = getIssuer(sdk, options);
  var userinfoUrl = removeTrailingSlash(options.userinfoUrl) || sdk.options.userinfoUrl;
  var tokenUrl = removeTrailingSlash(options.tokenUrl) || sdk.options.tokenUrl;
  var logoutUrl = removeTrailingSlash(options.logoutUrl) || sdk.options.logoutUrl;
  var revokeUrl = removeTrailingSlash(options.revokeUrl) || sdk.options.revokeUrl;

  var baseUrl = getOAuthBaseUrl(sdk, options);

  authorizeUrl = authorizeUrl || baseUrl + '/v1/authorize';
  userinfoUrl = userinfoUrl || baseUrl + '/v1/userinfo';
  tokenUrl = tokenUrl || baseUrl + '/v1/token';
  revokeUrl = revokeUrl || baseUrl + '/v1/revoke';
  logoutUrl = logoutUrl || baseUrl + '/v1/logout';

  return {
    issuer: issuer,
    authorizeUrl: authorizeUrl,
    userinfoUrl: userinfoUrl,
    tokenUrl: tokenUrl,
    revokeUrl: revokeUrl,
    logoutUrl: logoutUrl
  };
}
