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
import { IdxRemediationValue } from '../../../../lib/idx/types/idx-js';
import { PasswordFormFactory, VerifyPasscodeFormFactory } from './forms';

export const IdxValueFactory = Factory.define<IdxRemediationValue>(() => {
  return {
    name: 'unknown-name'
  };
});

export const UsernameValueFactory = IdxValueFactory.params({
  name: 'identifier',
  label: 'Username',
  required: true
});

export const CredentialsValueFactory = IdxValueFactory.params({
  name: 'credentials',
  required: true
});

export const PasswordValueFactory = CredentialsValueFactory.afterBuild(res => {
  res.form = PasswordFormFactory.build();
});

export const VerifyPasscodeValueFactor = CredentialsValueFactory.afterBuild(res => {
  res.form = VerifyPasscodeFormFactory.build();
});

export const AuthenticatorValueFactory = IdxValueFactory.params({
  name: 'authenticator'
});

export const IdValueFactory = IdxValueFactory.params({
  name: 'id',
  required: true,
  value: 'unknown-id-value',
  mutable: false
});

export const PhoneMethodTypeValueFactory = IdxValueFactory.params({
  name: 'methodType',
  required: true,
  type: 'string',
  options: [{
    label: 'SMS',
    value: 'sms'
  }, {
    label: 'Voice call',
    value: 'voice'
  }]
});

export const OktaVerifyMethodTypeValueFactory = IdxValueFactory.params({
  name: 'methodType',
  required: true,
  type: 'string',

  options: [{
    label: 'Enter a code',
    value: 'totp'
  }, {
    label: 'Get a push notification',
    value: 'push'
  }]
});

export const OktaVerifyEnrollmentChannelValueFactory = IdxValueFactory.params({
  name: 'channel',
  type: 'string',
  required: false,
  options: [
    {
      label: 'QRCODE',
      value: 'qrcode'
    },
    {
      label: 'EMAIL',
      value: 'email'
    },
    {
      label: 'SMS',
      value: 'sms'
    }
  ]
});

export const OtpMethodTypeValueFactory = IdxValueFactory.params({
  name: 'methodType',
  required: false,
  value: 'otp'
});

export const PhoneNumberValueFactory = IdxValueFactory.params({
  name: 'phoneNumber',
  required: true,
});


export const FirstNameValueFactory = IdxValueFactory.params({
  'name': 'firstName',
  'label': 'First name',
  'required': true,
  'minLength': 1,
  'maxLength': 50
});

export const LastNameValueFactory = IdxValueFactory.params({
  'name': 'lastName',
  'label': 'Last name',
  'required': true,
  'minLength': 1,
  'maxLength': 50
});


export const EmailValueFactory = IdxValueFactory.params({
  'name': 'email',
  'label': 'Email',
  'required': true
});

export const CustomAttributeValueFactory = IdxValueFactory.params({
  'name': 'customAttribute',
  'label': 'Custom Atrribute',
  'required': true,
});

export const NewPasswordValueFactory = IdxValueFactory.params({
  'name': 'passcode',
  'label': 'New password',
  'secret': true
});

export const PasscodeValueFactory = IdxValueFactory.params({
  'name': 'passcode',
  'label': 'Enter code',
});

export const WebauthnMethodTypeValueFactory = IdxValueFactory.params({
  name: 'methodType',
  required: false,
  value: 'webauthn',
  mutable: false
});
export const OktaVerifyPushOnlyMethodTypeValueFactory = IdxValueFactory.params({
  name: 'methodType',
  required: true,
  options: [
    {
      label: 'Get a push notification',
      value: 'push'
    },
  ]
});

export const StateHandleValueFactory = IdxValueFactory.params({
  name: 'stateHandle',
  required: true,
  value: '02CqFbzJ_zMGCqXut-1CNXfafiTkh9wGlbFqi9Xupt',
  visible: false,
  mutable: false
});

