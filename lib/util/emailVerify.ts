
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

import { urlParamsToObject  } from '../oidc/util/urlParams';

export interface EmailVerifyCallbackResponse {
  state: string;
  stateTokenExternalId: string;
}

// Check if state && stateTokenExternalId have been passed back in the url
export function isEmailVerifyCallback (urlPath: string): boolean {
  return /(stateTokenExternalId=)/i.test(urlPath) && /(state=)/i.test(urlPath);
}

// Parse state and stateTokenExternalId from a urlPath (should be either a search or fragment from the URL)
export function parseEmailVerifyCallback(urlPath: string): EmailVerifyCallbackResponse {
  return urlParamsToObject(urlPath) as EmailVerifyCallbackResponse;
}
