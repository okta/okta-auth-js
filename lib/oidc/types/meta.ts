/*!
 * Copyright (c) 2021-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { CustomUrls, TokenParams } from './options';

// formerly known as "Redirect OAuth Params"
export interface OAuthTransactionMeta extends
  Pick<TokenParams,
    'issuer' |
    'clientId' |
    'redirectUri' |
    'responseType' |
    'responseMode' |
    'scopes' |
    'state' |
    'pkce' |
    'ignoreSignature' |
    'nonce' |
    'acrValues' |
    'enrollAmrValues' |
    'extraParams'
  >
{
  urls: CustomUrls;
  originalUri?: string;
}

export interface PKCETransactionMeta extends
  OAuthTransactionMeta,
  Pick<TokenParams,
    'codeChallenge' |
    'codeChallengeMethod' |
    'codeVerifier'
  >
{}

export interface TransactionMetaOptions extends
  Pick<PKCETransactionMeta,
    'state' |
    'codeChallenge' |
    'codeChallengeMethod' |
    'codeVerifier'
  >
{
  muteWarning?: boolean;
}
