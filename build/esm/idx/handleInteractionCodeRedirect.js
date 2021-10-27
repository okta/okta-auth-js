import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";

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
import { AuthSdkError, OAuthError } from '../errors';
export function handleInteractionCodeRedirect(_x, _x2) {
  return _handleInteractionCodeRedirect.apply(this, arguments);
}

function _handleInteractionCodeRedirect() {
  _handleInteractionCodeRedirect = _asyncToGenerator(function* (authClient, url) {
    var meta = authClient.transactionManager.load();

    if (!meta) {
      throw new AuthSdkError('No transaction data was found in storage');
    }

    var {
      codeVerifier,
      state: savedState
    } = meta;
    var {
      searchParams // URL API has been added to the polyfill
      // eslint-disable-next-line compat/compat

    } = new URL(url);
    var state = searchParams.get('state');
    var interactionCode = searchParams.get('interaction_code'); // Error handling

    var error = searchParams.get('error');

    if (error) {
      throw new OAuthError(error, searchParams.get('error_description'));
    }

    if (state !== savedState) {
      throw new AuthSdkError('State in redirect uri does not match with transaction state');
    }

    if (!interactionCode) {
      throw new AuthSdkError('Unable to parse interaction_code from the url');
    } // Save tokens to storage


    var {
      tokens
    } = yield authClient.token.exchangeCodeForTokens({
      interactionCode,
      codeVerifier
    });
    authClient.tokenManager.setTokens(tokens);
  });
  return _handleInteractionCodeRedirect.apply(this, arguments);
}
//# sourceMappingURL=handleInteractionCodeRedirect.js.map