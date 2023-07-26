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

import { PromiseQueue } from '../../util';
import { decodeToken } from '../decodeToken';
import { exchangeCodeForTokens } from '../exchangeCodeForTokens';
import { getUserInfo } from '../getUserInfo';
import { getWithoutPrompt } from '../getWithoutPrompt';
import { getWithPopup } from '../getWithPopup';
import { getWithRedirect } from '../getWithRedirect';
import { parseFromUrl } from '../parseFromUrl';
import { renewToken } from '../renewToken';
import { renewTokens } from '../renewTokens';
import { renewTokensWithRefresh } from '../renewTokensWithRefresh';
import { revokeToken } from '../revokeToken';
import { oidcIntrospect } from '../introspect';
import {
  AccessToken,
  CustomUserClaims,
  GetWithRedirectFunction,
  IDToken,
  OktaAuthOAuthInterface,
  ParseFromUrlInterface,
  TokenAPI,
  UserClaims,
  Endpoints,
} from '../types';
import { isLoginRedirect, prepareTokenParams } from '../util';
import { verifyToken } from '../verifyToken';
import { enrollAuthenticator } from '../enrollAuthenticator';

// Factory
export function createTokenAPI(sdk: OktaAuthOAuthInterface, queue: PromiseQueue): TokenAPI {
  const useQueue = (method) => {
    return PromiseQueue.prototype.push.bind(queue, method, null);
  };

  const getWithRedirectFn = useQueue(getWithRedirect.bind(null, sdk)) as GetWithRedirectFunction;

  // eslint-disable-next-line max-len
  const parseFromUrlFn = useQueue(parseFromUrl.bind(null, sdk)) as ParseFromUrlInterface;
  const parseFromUrlApi: ParseFromUrlInterface = Object.assign(parseFromUrlFn, {
    // This is exposed so we can mock getting window.history in our tests
    _getHistory: function() {
      return window.history;
    },

    // This is exposed so we can mock getting window.location in our tests
    _getLocation: function() {
      return window.location;
    },

    // This is exposed so we can mock getting window.document in our tests
    _getDocument: function() {
      return window.document;
    }
  });

  const token: TokenAPI ={
    prepareTokenParams: prepareTokenParams.bind(null, sdk),
    exchangeCodeForTokens: exchangeCodeForTokens.bind(null, sdk),
    getWithoutPrompt: getWithoutPrompt.bind(null, sdk),
    getWithPopup: getWithPopup.bind(null, sdk),
    getWithRedirect: getWithRedirectFn,
    parseFromUrl: parseFromUrlApi,
    decode: decodeToken,
    revoke: revokeToken.bind(null, sdk),
    renew: renewToken.bind(null, sdk),
    renewTokensWithRefresh: renewTokensWithRefresh.bind(null, sdk),
    renewTokens: renewTokens.bind(null, sdk),
    getUserInfo: <C extends CustomUserClaims = CustomUserClaims>(
      accessTokenObject: AccessToken,
      idTokenObject: IDToken
    ): Promise<UserClaims<C>> => {
      return getUserInfo(sdk, accessTokenObject, idTokenObject);
    },
    verify: verifyToken.bind(null, sdk),
    isLoginRedirect: isLoginRedirect.bind(null, sdk),
    introspect: oidcIntrospect.bind(null, sdk),
  };

  // Wrap certain async token API methods using PromiseQueue to avoid issues with concurrency
  // 'getWithRedirect' and 'parseFromUrl' are already wrapped
  const toWrap = [
    'getWithoutPrompt',
    'getWithPopup',
    'revoke',
    'renew',
    'renewTokensWithRefresh',
    'renewTokens'
  ];
  toWrap.forEach(key => {
    token[key] = useQueue(token[key]);
  });

  return token;
}

export function createEndpoints(sdk: OktaAuthOAuthInterface): Endpoints {
  return {
    authorize: {
      enrollAuthenticator: enrollAuthenticator.bind(null, sdk),
    }
  };
}
