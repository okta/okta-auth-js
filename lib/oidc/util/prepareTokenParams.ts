/* eslint-disable complexity */
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
import { getWellKnown } from '../endpoints/well-known';
import { AuthSdkError } from '../../errors';
import { OktaAuthOAuthInterface, TokenParams } from '../types';
import { getDefaultTokenParams } from './defaultTokenParams';
import { DEFAULT_CODE_CHALLENGE_METHOD } from '../../constants';
import PKCE from './pkce';
import { OktaAuthBaseInterface } from '../../base/types';

export function assertPKCESupport(sdk: OktaAuthBaseInterface) {
  if (!sdk.features.isPKCESupported()) {
    var errorMessage = 'PKCE requires a modern browser with encryption support running in a secure context.';
    if (!sdk.features.isHTTPS()) {
      // eslint-disable-next-line max-len
      errorMessage += '\nThe current page is not being served with HTTPS protocol. PKCE requires secure HTTPS protocol.';
    }
    if (!sdk.features.hasTextEncoder()) {
      // eslint-disable-next-line max-len
      errorMessage += '\n"TextEncoder" is not defined. To use PKCE, you may need to include a polyfill/shim for this browser.';
    }
    throw new AuthSdkError(errorMessage);
  }
}

export async function validateCodeChallengeMethod(sdk: OktaAuthOAuthInterface, codeChallengeMethod?: string) {
  // set default code challenge method, if none provided
  codeChallengeMethod = codeChallengeMethod || sdk.options.codeChallengeMethod || DEFAULT_CODE_CHALLENGE_METHOD;

  // validate against .well-known/openid-configuration
  const wellKnownResponse = await getWellKnown(sdk);
  var methods = wellKnownResponse['code_challenge_methods_supported'] || [];
  if (methods.indexOf(codeChallengeMethod) === -1) {
    throw new AuthSdkError('Invalid code_challenge_method');
  }
  return codeChallengeMethod;
}

export async function preparePKCE(
  sdk: OktaAuthOAuthInterface, 
  tokenParams: TokenParams
): Promise<TokenParams> {
  let {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod
  } = tokenParams;

  // PKCE calculations can be avoided by passing a codeChallenge
  codeChallenge = codeChallenge || sdk.options.codeChallenge;
  if (!codeChallenge) {
    assertPKCESupport(sdk);
    codeVerifier = codeVerifier || PKCE.generateVerifier();
    codeChallenge = await PKCE.computeChallenge(codeVerifier);
  }
  codeChallengeMethod = await validateCodeChallengeMethod(sdk, codeChallengeMethod);

  // Clone/copy the params. Set PKCE values
  tokenParams = {
    ...tokenParams,
    responseType: 'code', // responseType is forced
    codeVerifier,
    codeChallenge,
    codeChallengeMethod
  };

  return tokenParams;
}

// Prepares params for a call to /authorize or /token
export async function prepareTokenParams(
  sdk: OktaAuthOAuthInterface,
  tokenParams: TokenParams = {}
): Promise<TokenParams> {
  // build params using defaults + options
  const defaults = getDefaultTokenParams(sdk);
  tokenParams = { ...defaults, ...tokenParams };

  if (tokenParams.dpop && !sdk.features.isDPoPSupported()) {
    throw new AuthSdkError('DPoP has been configured, but is not supported by browser');
  }

  if (tokenParams.pkce === false) {
    // Implicit flow or authorization_code without PKCE
    return tokenParams;
  }

  return preparePKCE(sdk, tokenParams);
}