/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
/* eslint-disable complexity, max-statements */

import AuthSdkError from '../../errors/AuthSdkError';
import { OktaAuthOAuthInterface, TokenVerifyParams, UserClaims } from '../../oidc/types';

export function validateClaims(sdk: OktaAuthOAuthInterface, claims: UserClaims, validationParams: TokenVerifyParams) {
  const aud = validationParams.clientId;
  const iss = validationParams.issuer;
  const nonce = validationParams.nonce;
  const acr = validationParams.acrValues;

  if (!claims || !iss || !aud) {
    throw new AuthSdkError('The jwt, iss, and aud arguments are all required');
  }

  if (nonce && claims.nonce !== nonce) {
    throw new AuthSdkError('OAuth flow response nonce doesn\'t match request nonce');
  }

  const now = Math.floor(Date.now()/1000);

  if (claims.iss !== iss) {
    throw new AuthSdkError('The issuer [' + claims.iss + '] ' +
      'does not match [' + iss + ']');
  }

  if ((Array.isArray(claims.aud) && claims.aud.indexOf(aud) < 0) ||
    (!Array.isArray(claims.aud) && claims.aud !== aud))
  {
    throw new AuthSdkError('The audience [' + claims.aud + '] ' +
      'does not match [' + aud + ']');
  }

  if (acr && claims.acr !== acr) {
    throw new AuthSdkError('The acr [' + claims.acr + '] ' +
      'does not match acr_values [' + acr + ']');
  }

  if (claims.iat! > claims.exp!) {
    throw new AuthSdkError('The JWT expired before it was issued');
  }

  if (!sdk.options.ignoreLifetime) {
    if ((now - sdk.options.maxClockSkew!) > claims.exp!) {
      throw new AuthSdkError('The JWT expired and is no longer valid');
    }

    if (claims.iat! > (now + sdk.options.maxClockSkew!)) {
      throw new AuthSdkError('The JWT was issued in the future');
    }
  }
}
