
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

import { OktaAuthIdxInterface } from './types';

import CustomError from '../errors/CustomError';
import { urlParamsToObject  } from '../oidc/util/urlParams';
import { EmailVerifyCallbackResponse } from './types/api';

export class EmailVerifyCallbackError extends CustomError {
  state: string;
  otp: string;

  constructor(state: string, otp: string) {
    super(`Enter the OTP code in the originating client: ${otp}`);
    this.name = 'EmailVerifyCallbackError';
    this.state = state;
    this.otp = otp;
  }
}

export function isEmailVerifyCallbackError(error: Error) {
  return (error.name === 'EmailVerifyCallbackError');
}

// Check if state && otp have been passed back in the url
export function isEmailVerifyCallback (urlPath: string): boolean {
  return /(otp=)/i.test(urlPath) && /(state=)/i.test(urlPath);
}

// Parse state and otp from a urlPath (should be either a search or fragment from the URL)
export function parseEmailVerifyCallback(urlPath: string): EmailVerifyCallbackResponse {
  return urlParamsToObject(urlPath) as EmailVerifyCallbackResponse;
}

export async function handleEmailVerifyCallback(authClient: OktaAuthIdxInterface, search: string) {
  if (isEmailVerifyCallback(search)) {
    const { state, otp } = parseEmailVerifyCallback(search);
    if (authClient.idx.canProceed({ state })) {
      // same browser / device
      return await authClient.idx.proceed({ state, otp });
    } else {
      // different browser or device
      throw new EmailVerifyCallbackError(state, otp);
    }
  }
}
