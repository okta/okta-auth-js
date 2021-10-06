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
import { IdxRemediation, IdxAuthenticator, IdxForm } from '../../../../lib/idx/types/idx-js';
import {
  EmailAuthenticatorFactory,
  PasswordAuthenticatorFactory,
  PhoneAuthenticatorFactory,
  GoogleAuthenticatorFactory
} from './authenticators';
import { 
  EmailAuthenticatorFormFactory, 
  ExtendedUserProfileFormFactory, 
  PasswordFormFactory, 
  PhoneAuthenticatorFormFactory, 
  UserProfileFormFactory, 
  VerifyEmailFormFactory, 
  VerifySmsFormFactory,
  VerifyPasscodeFormFactory
} from './forms';
import {
  UsernameValueFactory,
  PasswordValueFactory,
  AuthenticatorValueFactory,
  CredentialsValueFactory,
  IdxValueFactory,
  NewPasswordValueFactory,
} from './values';

interface MockedIdxRemediation extends IdxRemediation {
  _authenticator?: IdxAuthenticator;
  _form?: IdxForm;
}

export const IdxRemediationFactory = Factory.define<MockedIdxRemediation>(() => {
  return {
    name: 'unknown-remediation',
    value: []
  };
});

export const IdentifyRemediationFactory = IdxRemediationFactory.params({
  name: 'identify',
  value:[
    UsernameValueFactory.build()
  ]
});

export const IdentifyWithPasswordRemediationFactory = IdentifyRemediationFactory.params({
  value:[
    UsernameValueFactory.build(),
    PasswordValueFactory.build()
  ]
});

export const ChallengeAuthenticatorRemediationFactory = IdentifyRemediationFactory.params({
  name: 'challenge-authenticator',
});


export const VerifyEmailRemediationFactory = ChallengeAuthenticatorRemediationFactory.params({
  name: 'challenge-authenticator',
  value: [
    CredentialsValueFactory.build({
      form: VerifyEmailFormFactory.build()
    })
  ],
  relatesTo: {
    value: EmailAuthenticatorFactory.build()
  }
});

export const VerifyGoogleAuthenticatorRemediationFactory = ChallengeAuthenticatorRemediationFactory.params({
  name: 'challenge-authenticator',
  value: [
    CredentialsValueFactory.build({
      form: VerifyPasscodeFormFactory.build()
    })
  ],
  relatesTo: {
    value: GoogleAuthenticatorFactory.build()
  }
});


export const VerifyPasswordRemediationFactory = ChallengeAuthenticatorRemediationFactory.params({
  name: 'challenge-authenticator',
  value: [
    PasswordValueFactory.build()
  ],
  relatesTo: {
    value: PasswordAuthenticatorFactory.build()
  }
});

export const SelectAuthenticatorAuthenticateRemediationFactory = IdxRemediationFactory.params({
  name: 'select-authenticator-authenticate',
});

export const SelectAuthenticatorEnrollRemediationFactory = IdxRemediationFactory.params({
  name: 'select-authenticator-enroll',
});

export const RecoverPasswordRemediationFactory = IdxRemediationFactory.params({
  name: 'recover'
});

export const AuthenticatorEnrollmentDataRemediationFactory = IdxRemediationFactory.params({
  name: 'authenticator-enrollment-data'
});

export const PhoneAuthenticatorEnrollmentDataRemediationFactory = AuthenticatorEnrollmentDataRemediationFactory.params({
  relatesTo: {
    type: 'object',
    value: PhoneAuthenticatorFactory.build()
  },
  value: [
    AuthenticatorValueFactory.build({
      label: 'Phone',
      form: PhoneAuthenticatorFormFactory.build()
    })
  ]
});

export const EnrollAuthenticatorRemediationFactory = IdxRemediationFactory.params({
  name: 'enroll-authenticator'
});

export const EnrollPasswordAuthenticatorRemediationFactory =  EnrollAuthenticatorRemediationFactory.params({
  relatesTo: {
    type: 'object',
    value: PasswordAuthenticatorFactory.build()
  },
  value: [
    CredentialsValueFactory.build({
      form: PasswordFormFactory.build()
    })
  ]
});

export const EnrollEmailAuthenticatorRemediationFactory = EnrollAuthenticatorRemediationFactory.params({
  relatesTo: {
    type: 'object',
    value: EmailAuthenticatorFactory.build()
  },
  value: [
    CredentialsValueFactory.build({
      form: EmailAuthenticatorFormFactory.build()
    })
  ]
});

export const EnrollPhoneAuthenticatorRemediationFactory = EnrollAuthenticatorRemediationFactory.params({
  relatesTo: {
    type: 'object',
    value: PhoneAuthenticatorFactory.build()
  },
  value: [
    CredentialsValueFactory.build({
      form: VerifySmsFormFactory.build()
    })
  ]
});

export const EnrollGoogleAuthenticatorRemediationFactory = EnrollAuthenticatorRemediationFactory.params({
  relatesTo: {
    type: 'object',
    value: GoogleAuthenticatorFactory.build()
  },
  value: [
    CredentialsValueFactory.build({
      form: VerifyPasscodeFormFactory.build()
    })
  ]
});

export const EnrollProfileRemediationFactory = IdxRemediationFactory.params({
  name: 'enroll-profile',
  value: [
    IdxValueFactory.build({
      name: 'userProfile',
      form: UserProfileFormFactory.build()
    })
  ]
});

export const EnrollExtendedProfileRemediationFactory = IdxRemediationFactory.params({
  name: 'enroll-profile',
  value: [
    IdxValueFactory.build({
      name: 'userProfile',
      form: ExtendedUserProfileFormFactory.build()
    })
  ]
});

export const SelectEnrollProfileRemediationFactory = IdxRemediationFactory.params({
  name: 'select-enroll-profile'
});

export const IdentifyRecoveryRemediationFactory = IdxRemediationFactory.params({
  name: 'identify-recovery',
  value: [
    UsernameValueFactory.build()
  ]
});

export const ReEnrollAuthenticatorRemediationFactory = IdxRemediationFactory.params({
  name: 'reenroll-authenticator',
});

export const ReEnrollPasswordAuthenticatorRemediationFactory = ReEnrollAuthenticatorRemediationFactory.params({
  relatesTo: {
    type: 'object',
    value: PasswordAuthenticatorFactory.build()
  },
  value: [
    CredentialsValueFactory.build({
      form: {
        value: [
          NewPasswordValueFactory.build()
        ]
      }
    })
  ]
});

export const AuthenticatorVerificationDataRemediationFactory = IdxRemediationFactory.params({
  name: 'authenticator-verification-data',
});

export const PasswordAuthenticatorVerificationDataRemediationFactory = AuthenticatorVerificationDataRemediationFactory.params({
  relatesTo: {
    type: 'object',
    value: PasswordAuthenticatorFactory.build()
  },
  value: [
    AuthenticatorValueFactory.build({
      label: 'Password',
      form: PasswordFormFactory.build()
    })
  ]
});

export const PhoneAuthenticatorVerificationDataRemediationFactory = AuthenticatorVerificationDataRemediationFactory.params({
  relatesTo: {
    type: 'object',
    value: PhoneAuthenticatorFactory.build()
  },
  value: [
    AuthenticatorValueFactory.build({
      label: 'Phone',
      form: PhoneAuthenticatorFormFactory.build()
    })
  ]
});

export const RedirectIdpRemediationFactory = IdxRemediationFactory.params({
  name: 'redirect-idp',
});

export const SkipRemediationFactory = IdxRemediationFactory.params({
  name: 'skip'
});
