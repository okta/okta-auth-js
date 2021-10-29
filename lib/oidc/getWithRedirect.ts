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
import { AuthSdkError } from '../errors';
import { OktaAuth, TokenParams, TransactionMeta } from '../types';
import { clone } from '../util';
import { getOAuthUrls, prepareTokenParams } from './util';
import { buildAuthorizeParams } from './endpoints/authorize';

export function getWithRedirect(sdk: OktaAuth, options: TokenParams): Promise<void> {
  if (arguments.length > 2) {
    return Promise.reject(new AuthSdkError('As of version 3.0, "getWithRedirect" takes only a single set of options'));
  }

  options = clone(options) || {};

  return prepareTokenParams(sdk, options)
    .then(function (tokenParams: TokenParams) {
      const urls = getOAuthUrls(sdk, options);
      const requestUrl = urls.authorizeUrl + buildAuthorizeParams(tokenParams);
      const issuer = sdk.options.issuer;

      // Gather the values we want to save in the transaction
      const {
        responseType,
        state,
        nonce,
        scopes,
        clientId,
        ignoreSignature,
        redirectUri,
        codeVerifier,
        codeChallenge,
        codeChallengeMethod,
      } = tokenParams;

      const oauthMeta: TransactionMeta = {
        issuer,
        responseType,
        state,
        nonce,
        scopes,
        clientId,
        urls,
        ignoreSignature,
        redirectUri,
        codeVerifier,
        codeChallenge,
        codeChallengeMethod
      };

      sdk.transactionManager.save(oauthMeta, { oauth: true });
      sdk.token.getWithRedirect._setLocation(requestUrl);
    });
}
