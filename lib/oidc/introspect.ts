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
import { getWellKnown } from './endpoints/well-known';
import { post } from '../http';
import { toQueryString } from '../util';
import { btoa } from '../crypto';
import { AccessToken, Token, TokenKind } from './types';

const hintMap = {
  accessToken: 'access_token',
  idToken: 'id_token',
  refreshToken: 'refresh_token'
};

export async function oidcIntrospect (sdk, kind: TokenKind, token?: Token) {
  let issuer: string;
  let clientId: string = sdk.options.clientId;
  let clientSecret: string | undefined = sdk.options.clientSecret;

  if (!token) {
    token = sdk.tokenManager.getTokens()[kind];
  }

  if (kind !== TokenKind.ACCESS) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    issuer = (token! as any).issuer;
  }
  else {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    issuer = (token as AccessToken).claims.iss!;
  }
  issuer ??= sdk.options.issuer;

  if (!clientId) {
    throw new AuthSdkError('A clientId must be specified in the OktaAuth constructor to introspect a token');
  }
  if (!issuer) {
    return Promise.reject(new AuthSdkError('Unable to find issuer'));
  }
  if (!kind || !token) {
    return Promise.reject(new AuthSdkError(`${kind} token not found`));
  }

  const { introspect_endpoint: introspectUrl } = await getWellKnown(sdk, issuer);
  const authHeader = clientSecret ? btoa(`${clientId}:${clientSecret}`) : btoa(clientId);
  const args = toQueryString({
    // eslint-disable-next-line camelcase
    token_type_hint: hintMap[kind],
    token: token[kind]    // extract raw token string from token object
  }).slice(1);
  return post(sdk, introspectUrl, args, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + authHeader
    }
  });
}
