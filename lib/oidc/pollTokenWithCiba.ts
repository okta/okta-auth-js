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

/* eslint-disable camelcase */
import { getOAuthUrls } from './util/oauth';
import { AuthSdkError } from './../errors';
import { OktaAuthOAuthInterface, OAuthResponse, CibaTokenOptions, TokenParamsProto } from './types';
import { postToTokenEndpoint } from './endpoints';
import { prepareClientAuthenticationParams } from './util/prepareClientAuthenticationParams';

const GRANT_TYPE = 'urn:openid:params:grant-type:ciba';

export async function pollTokenWithCiba(
  sdk: OktaAuthOAuthInterface, 
  options: CibaTokenOptions
): Promise<OAuthResponse> {
  options = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore allow clientId overwrite
    clientId: sdk.options.clientId,
    clientSecret: sdk.options.clientSecret!,
    privateKey: sdk.options.privateKey,
    ...options, // favor fn options
  };

  if (!options.authReqId) {
    throw new AuthSdkError('Missing authReqId to pull token from authorization server');
  }

  const urls = getOAuthUrls(sdk);
  const clientAuthParams = await prepareClientAuthenticationParams(sdk, options);

  const payload: TokenParamsProto = {
    ...clientAuthParams,
    grant_type: GRANT_TYPE,
    auth_req_id: options.authReqId,
  };

  return postToTokenEndpoint(sdk, payload, urls);
}
