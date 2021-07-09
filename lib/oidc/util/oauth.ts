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
import { OktaAuth, CustomUrls } from '../../types';
import { getWellKnown  } from '../endpoints/well-known';

export function generateState() {
  return genRandomString(64);
}

export function generateNonce() {
  return genRandomString(64);
}

async function getIssuer(sdk: OktaAuth, options: CustomUrls = {}) {
  const { issuer } = await getOAuthUrls(sdk, options);
  return issuer;
}

export async function getOAuthBaseUrl(sdk: OktaAuth, options: CustomUrls = {}) {
  const issuer = await getIssuer(sdk, options);
  const baseUrl = issuer.indexOf('/oauth2') > 0 ? issuer : issuer + '/oauth2';
  return baseUrl;
}

export async function getOAuthDomain(sdk: OktaAuth, options: CustomUrls = {}) {
  const issuer = await getIssuer(sdk, options);
  const domain = issuer.split('/oauth2')[0];
  return domain;
}

async function getUrlsFromWellKnown(sdk: OktaAuth, baseUrl?: string) {
  const openIdConfig = await getWellKnown(sdk, baseUrl);
  
  const {
    issuer,
    authorization_endpoint: authorizeUrl,
    token_endpoint: tokenUrl,
    userinfo_endpoint: userinfoUrl,
    revocation_endpoint: revokeUrl,
    end_session_endpoint: logoutUrl
   } = openIdConfig;

   return {
    issuer,
    authorizeUrl,
    userinfoUrl,
    tokenUrl,
    revokeUrl,
    logoutUrl
   };
}

function getUrlsFromSDKOptions(sdk: OktaAuth) {
  const {
    issuer,
    authorizeUrl,
    tokenUrl,
    userinfoUrl,
    revokeUrl,
    logoutUrl
   } = sdk.options;

  return {
    issuer,
    authorizeUrl,
    userinfoUrl,
    tokenUrl,
    revokeUrl,
    logoutUrl
   };
}

export async function getOAuthUrls(sdk: OktaAuth, options?: CustomUrls) {
  if (arguments.length > 2) {
    throw new AuthSdkError('As of version 3.0, "getOAuthUrls" takes only a single set of options');
  }
  options = options || {};
  Object.keys(options).forEach(key => {
    options[key] = removeTrailingSlash(options[key]);
  });
  let urls = await getUrlsFromWellKnown(sdk, options.issuer);
  const { issuer } = urls;
  urls = Object.assign({},
    urls,
    getUrlsFromSDKOptions(sdk), // sdk options override well-known
    options, // passed options override sdk options
    { issuer }  // always use issuer from well-known endpoint
  );
  return urls;

  // Get user-supplied arguments
  // var authorizeUrl = removeTrailingSlash(options.authorizeUrl) || sdk.options.authorizeUrl || ;
  // var issuer = getIssuer(sdk, options);
  // var userinfoUrl = removeTrailingSlash(options.userinfoUrl) || sdk.options.userinfoUrl;
  // var tokenUrl = removeTrailingSlash(options.tokenUrl) || sdk.options.tokenUrl;
  // var logoutUrl = removeTrailingSlash(options.logoutUrl) || sdk.options.logoutUrl;
  // var revokeUrl = removeTrailingSlash(options.revokeUrl) || sdk.options.revokeUrl;

  // var baseUrl = getOAuthBaseUrl(sdk, options);

  // authorizeUrl = authorizeUrl || baseUrl + '/v1/authorize';
  // userinfoUrl = userinfoUrl || baseUrl + '/v1/userinfo';
  // tokenUrl = tokenUrl || baseUrl + '/v1/token';
  // revokeUrl = revokeUrl || baseUrl + '/v1/revoke';
  // logoutUrl = logoutUrl || baseUrl + '/v1/logout';

  // return {
  //   issuer: issuer,
  //   authorizeUrl: authorizeUrl,
  //   userinfoUrl: userinfoUrl,
  //   tokenUrl: tokenUrl,
  //   revokeUrl: revokeUrl,
  //   logoutUrl: logoutUrl
  // };
}
