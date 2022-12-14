
/* global window */
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
import { generateState } from './oauth';
import { OktaAuthOAuthInterface, TokenParams } from '../types';
import { isBrowser } from '../../features';
import { removeNils } from '../../util';

export function getDefaultEnrollAuthenticatorParams(sdk: OktaAuthOAuthInterface): TokenParams {
  const {
    clientId,
    redirectUri,
    responseMode,
    state,
  } = sdk.options;
  const defaultRedirectUri = isBrowser() ? window.location.href : undefined;
  return removeNils({
    clientId,
    redirectUri: redirectUri || defaultRedirectUri,
    responseMode,
    state: state || generateState(),
    responseType: 'none',
    prompt: 'enroll_authenticator',
  });
}