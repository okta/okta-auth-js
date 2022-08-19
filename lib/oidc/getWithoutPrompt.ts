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
import { OktaAuthOAuthInterface, TokenParams, TokenResponse } from './types';
import { clone } from '../util';
import { getToken } from './getToken';

export function getWithoutPrompt(sdk: OktaAuthOAuthInterface, options: TokenParams): Promise<TokenResponse> {
  if (arguments.length > 2) {
    return Promise.reject(new AuthSdkError('As of version 3.0, "getWithoutPrompt" takes only a single set of options'));
  }
  
  options = clone(options) || {};
  Object.assign(options, {
    prompt: 'none',
    responseMode: 'okta_post_message',
    display: null
  });
  return getToken(sdk, options);
}

