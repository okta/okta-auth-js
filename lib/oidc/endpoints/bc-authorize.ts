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

import { httpRequest } from '../../http';
import { toQueryString } from '../../util';
import { getOAuthBaseUrl } from '../util';
import { 
  OktaAuthOAuthInterface, 
  CibaAuthResponse, 
  CibaAuthorizeParams,
} from '../types';

export async function postToBcAuthorizeEndpoint(
  sdk: OktaAuthOAuthInterface, 
  options: CibaAuthorizeParams,
): Promise<CibaAuthResponse> {
  const url = getOAuthBaseUrl(sdk) + '/v1/bc/authorize';
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  const args = toQueryString(options).slice(1);

  return httpRequest(sdk, {
    url,
    method: 'POST',
    args,
    headers
  });
}
