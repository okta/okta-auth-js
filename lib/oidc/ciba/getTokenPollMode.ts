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
import { postToTokenEndpoint } from '../endpoints';
import { getOAuthUrls, prepareClientAuthenticationParams } from '../util';
import { AuthSdkError } from '../../errors';
import { 
  OktaAuthOAuthInterface, 
  OAuthResponse, 
  CibaGetTokenPollModeOptions, 
  TokenParamsProto,
  ClientAuthenticationOptions,
} from '../types';

const GRANT_TYPE = 'urn:openid:params:grant-type:ciba';

export async function getTokenPollMode(
  sdk: OktaAuthOAuthInterface, 
  options: CibaGetTokenPollModeOptions
): Promise<OAuthResponse> {
  if (!options.authReqId) {
    throw new AuthSdkError('Option authReqId must be specified in the function options to poll token');
  }

  const urls = getOAuthUrls(sdk);
  const clientAuthParams = await prepareClientAuthenticationParams(sdk, {
    ...options,
    aud: urls.tokenUrl,
  } as ClientAuthenticationOptions);
  const payload: TokenParamsProto = {
    ...clientAuthParams,
    grant_type: GRANT_TYPE,
    auth_req_id: options.authReqId,
  };

  return postToTokenEndpoint(sdk, payload, urls);
}
