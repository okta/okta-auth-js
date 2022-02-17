/*!
 * Copyright (c) 2021-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { request } from './client';
import { validateVersionConfig } from './util';

export interface IntrospectOptions {
  domain: string;
  withCredentials?: boolean;
  interactionHandle?: string;
  stateHandle?: string;
  version?: string;
}

const introspect = async function introspect({
  withCredentials,
  domain,
  interactionHandle,
  stateHandle,
  version,
}: IntrospectOptions) {
  validateVersionConfig(version);
  const target = `${domain}/idp/idx/introspect`;
  const body = stateHandle ? { stateToken: stateHandle } : { interactionHandle };
  const headers = {
    'content-type': `application/ion+json; okta-version=${version}`, // Server wants this version info
    accept: `application/ion+json; okta-version=${version}`,
  };
  const credentials = withCredentials === false ? 'omit' : 'include';
  const response = await request(target, { credentials, headers, body: JSON.stringify(body) });
  const requestDidSucceed = response.ok;
  const responseJSON = await response.json();
  return { ...responseJSON, requestDidSucceed };
};

export default introspect;
