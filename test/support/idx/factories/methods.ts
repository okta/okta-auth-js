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


import { Factory } from 'fishery';
import { IdxAuthenticatorMethod } from '../../../../lib/idx/types/idx-js';

export const IdxAuthenticatorMethodFactory = Factory.define<IdxAuthenticatorMethod>(() => {
  return {
    type: 'unknown-method'
  };
});

export const PasswordAuthenticatorMethodFactory = IdxAuthenticatorMethodFactory.params({
  type: 'password'
});

export const PushAuthenticatorMethodFactory = IdxAuthenticatorMethodFactory.params({
  type: 'push'
});

export const TotpAuthenticatorMethodFactory = IdxAuthenticatorMethodFactory.params({
  type: 'totp'
});

export const SmsAuthenticatorMethodFactory = IdxAuthenticatorMethodFactory.params({
  type: 'sms'
});

export const VoiceAuthenticatorMethodFactory = IdxAuthenticatorMethodFactory.params({
  type: 'voice'
});

export const EmailAuthenticatorMethodFactory = IdxAuthenticatorMethodFactory.params({
  type: 'email'
});

export const OtpAuthenticatorMethodFactory = IdxAuthenticatorMethodFactory.params({
  type: 'otp'
});
