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
import { loadPopup } from './util';

export function getWithPopup(sdk: OktaAuthOAuthInterface, options: TokenParams): Promise<TokenResponse> {
  if (arguments.length > 2) {
    return Promise.reject(new AuthSdkError('As of version 3.0, "getWithPopup" takes only a single set of options'));
  }

  // some browsers (safari, firefox) block popup if it's initialed from an async process
  // here we create the popup window immediately after user interaction
  // then redirect to the /authorize endpoint when the requestUrl is available
  const popupWindow = loadPopup('/', options);
  options = clone(options) || {};
  Object.assign(options, {
    display: 'popup',
    responseMode: 'okta_post_message',
    popupWindow
  });
  return getToken(sdk, options);
}
