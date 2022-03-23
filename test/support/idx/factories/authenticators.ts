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
import { IdxAuthenticator } from '../../../../lib/idx/types/idx-js';
import {
  PasswordAuthenticatorMethodFactory,
  PushAuthenticatorMethodFactory,
  TotpAuthenticatorMethodFactory,
  SmsAuthenticatorMethodFactory,
  VoiceAuthenticatorMethodFactory,
  EmailAuthenticatorMethodFactory,
  OtpAuthenticatorMethodFactory,
} from './methods';

export const IdxAuthenticatorFactory = Factory.define<IdxAuthenticator>(({
  sequence
}) => {
  return {
    id: `${sequence}`,
    displayName: 'unknown-authenticator',
    key: 'unknown-key',
    type: 'unknown-type',
    methods: []
  };
});

export const EmailAuthenticatorFactory = IdxAuthenticatorFactory.params({
  displayName: 'Email',
  type: 'email',
  key: 'okta_email',
  methods: [
    EmailAuthenticatorMethodFactory.build()
  ]
});

export const PasswordAuthenticatorFactory = IdxAuthenticatorFactory.params({
  displayName: 'Password',
  type: 'password',
  key: 'okta_password',
  methods: [
    PasswordAuthenticatorMethodFactory.build()
  ],
  settings: {
    complexity: {
      minLength: 8,
      minLowerCase: 0,
      minUpperCase: 0,
      minNumber: 0,
      minSymbol: 0,
      excludeUsername: true,
      excludeAttributes: []
    },
    age: {
      minAgeMinutes: 0,
      historyCount: 4
    }
  }
});

export const OktaVerifyAuthenticatorFactory = IdxAuthenticatorFactory.params({
  displayName: 'Okta Verify',
  id: 'id-okta-verify-authenticator',
  key: 'okta_verify',
  type: 'app',
  methods: [
    PushAuthenticatorMethodFactory.build(),
    TotpAuthenticatorMethodFactory.build()
  ]
});

export const OktaVerifyPushOnlyAuthenticatorFactory = IdxAuthenticatorFactory.params({
  // TODO: add resend mock? // resend: ResendPushOktaVerifyPushResendFactory
  displayName: 'Okta Verify',
  key: 'okta_verify',
  type: 'app',
  methods: [
    // push only
    PushAuthenticatorMethodFactory.build()
    // push only
  ]
});

export const OktaVerifyAuthenticatorWithContextualDataFactory = OktaVerifyAuthenticatorFactory.params({
  contextualData: {
    qrcode: {
      href: 'data:image/png;base64,fake_encoding==',
      method: 'embedded',
      type: 'image/png'
    },
  }
});

export const PhoneAuthenticatorFactory = IdxAuthenticatorFactory.params({
  displayName: 'Phone',
  key: 'phone_number',
  type: 'phone',
  methods: [
    SmsAuthenticatorMethodFactory.build(),
    VoiceAuthenticatorMethodFactory.build()
  ]
});

export const GoogleAuthenticatorFactory = IdxAuthenticatorFactory.params({
  displayName: 'Google Authenticator',
  key: 'google_otp',
  type: 'app',
  methods: [
    OtpAuthenticatorMethodFactory.build()
  ],
  contextualData: {
    qrcode: {
      href: 'data:image/png;base64,fake_encoding==',
      method: 'embedded',
      type: 'image/png'
    },
    sharedSecret: 'fake_secret'
  }
});

export const SecurityQuestionAuthenticatorFactory = IdxAuthenticatorFactory.params({
  displayName: 'Security Question',
  key: 'security_question',
  type: 'security_question',
  methods: [
    { type: 'security_question' }
  ]
});

export const WebauthnAuthenticatorFactory = IdxAuthenticatorFactory.params({
  displayName: 'Security Key or Biometric',
  key: 'webauthn',
  type: 'security_key',
  methods: [
    { type: 'webauthn' }
  ]
});

export const WebauthnEnrolledAuthenticatorFactory = IdxAuthenticatorFactory.params({
  displayName: 'MacBook Touch ID',
  key: 'webauthn',
  type: 'security_key',
  methods: [
    { type: 'webauthn' }
  ],
  credentialId: 'CREDENTIAL-ID'
});

export const AuthenticatorEnrollmentsForWebauthnDataFactory = {
  type: 'array',
  value: [
    WebauthnEnrolledAuthenticatorFactory.build()
  ]
};

