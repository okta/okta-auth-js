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
import { IdxForm, IdxRemediationValueForm } from '../../../../lib/idx/types/idx-js';

import {
  IdValueFactory,
  PhoneMethodTypeValueFactory,
  PhoneNumberValueFactory,
  FirstNameValueFactory,
  LastNameValueFactory,
  EmailValueFactory,
  PasscodeValueFactory,
  OtpMethodTypeValueFactory,
  OktaVerifyEnrollmentChannelValueFactory,
  CustomAttributeValueFactory,
  OktaVerifyMethodTypeValueFactory,
  WebauthnMethodTypeValueFactory,
} from './values';

export const IdxFormFactory = Factory.define<IdxForm>(() => {
  return {
    value: [
      // IdValueFactory.build()
    ]
  };
});


export const IdxRemediationValueFormFactory = Factory.define<IdxRemediationValueForm>(() => {
  return {
    form: {
      value: [IdValueFactory.build()]
    }
  };
});

export const PasswordFormFactory = IdxFormFactory.params({
  value: [{
    name: 'passcode',
    label: 'Password',
    secret: true
  }]
});

export const PasswordAuthenticatorFormFactory = IdxFormFactory.params({
  value: [
    IdValueFactory.build({
      value: 'id-password'
    })
  ]
});

export const EmailAuthenticatorFormFactory = IdxFormFactory.params({
  value: [
    IdValueFactory.build({
      value: 'id-email'
    })
  ]
});

export const GoogleAuthenticatorFormFactory = IdxFormFactory.params({
  value: [
    IdValueFactory.build({
      value: 'id-google-authenticator'
    }),
    OtpMethodTypeValueFactory.build()
  ]
});

export const SecurityQuestionAuthenticatorFormFactory = IdxFormFactory.params({
  value: [
    IdValueFactory.build({
      value: 'id-security-question-authenticator'
    })
  ]
});

export const WebauthnAuthenticatorFormFactory = IdxFormFactory.params({
  value: [
    IdValueFactory.build({
      value: 'id-webauthn-authenticator'
    }),
    WebauthnMethodTypeValueFactory.build()
  ]
});


// totp and push
export const OktaVerifyAuthenticatorFormFactory = IdxFormFactory.params({
  value: [
    IdValueFactory.build({
      value: 'id-okta-verify-authenticator'
    }),
    OktaVerifyMethodTypeValueFactory.build(),
  ]
});

// select enrollment channel
export const OktaVerifyAuthenticatorEnollmentChannelFormFactory = IdxRemediationValueFormFactory.params({
  form: {
    value: [
      IdValueFactory.build({
        value: 'id-okta-verify-authenticator'
      }),
      OktaVerifyEnrollmentChannelValueFactory.build(),
    ]
  }
});

export const PhoneAuthenticatorFormFactory = IdxFormFactory.params({
  value: [
    IdValueFactory.build({
      value: 'id-phone'
    }),
    PhoneMethodTypeValueFactory.build(),
    PhoneNumberValueFactory.build()
  ]
});

export const VerifySmsFormFactory = IdxFormFactory.params({
  value: [
    PasscodeValueFactory.build()
  ]
});

export const VerifyEmailFormFactory = IdxFormFactory.params({
  value: [
    PasscodeValueFactory.build()
  ]
});

export const VerifyPasscodeFormFactory = IdxFormFactory.params({
  value: [
    PasscodeValueFactory.build()
  ]
});

export const UserProfileFormFactory = IdxFormFactory.params({
  value: [
    FirstNameValueFactory.build(),
    LastNameValueFactory.build(),
    EmailValueFactory.build()
  ]
});

export const ExtendedUserProfileFormFactory = IdxFormFactory.params({
  value: [
    FirstNameValueFactory.build(),
    LastNameValueFactory.build(),
    EmailValueFactory.build(),
    CustomAttributeValueFactory.build()
  ]
});
