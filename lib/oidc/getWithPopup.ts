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
import { loadPopup, generateState } from './util';

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

export function getWithIDPPopup(
  sdk: OktaAuthOAuthInterface,
  options: Omit<TokenParams, 'redirectUri'> & { redirectUri: string }
): { cancel: () => void, promise: Promise<TokenResponse> } {
 try {
   // eslint-disable-next-line compat/compat
   if (!BroadcastChannel) {
    throw new AuthSdkError('Modern browser with `BroadcastChannel` support is required to use this method');
  }

  if (!options.redirectUri) {
    throw new AuthSdkError('`redirectUri` is a required param for `getWithIDPPopup`');
  }

  if (!options.state) {
    options.state = generateState();
  }

  // some browsers (safari, firefox) block popup if it's initialed from an async process
  // here we create the popup window immediately after user interaction
  // then redirect to the /authorize endpoint when the requestUrl is available
  const popupWindow = loadPopup('/', options);
  // eslint-disable-next-line compat/compat
  const channel = new BroadcastChannel(`popup-callback:${options.state}`);

  options = clone(options) || {};
  Object.assign(options, {
    display: 'popup',
    responseMode: 'query',
    popupWindow,
    idpPopup: true,
    channel,
  });

  let cancelPromise;
  const promise = new Promise<TokenResponse>((resolve, reject) => {
    cancelPromise = reject;
    return getToken(sdk, options)
    .then((res) => resolve(res))
    .catch(err => reject(err));
  });

  const cancel = () => {
    channel.close();
    cancelPromise(new AuthSdkError('Popup flow canceled'));
  };

  return {
    promise,
    cancel
  };
 }
 catch (err) {
  return {
    promise: Promise.reject(err),
    cancel: () => {}    // noop, no need to for method when error is thrown
  };
 }
}
