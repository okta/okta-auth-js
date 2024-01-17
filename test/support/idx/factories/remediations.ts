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
  GoogleAuthenticatorFactory,
  SecurityQuestionAuthenticatorFactory,
  OktaVerifyAuthenticatorFactory,
  WebauthnAuthenticatorFactory,
  OktaVerifyPushOnlyAuthenticatorFactory
} from './authenticators';
import { 
  EmailAuthenticatorFormFactory, 
  ExtendedUserProfileFormFactory, 
  PasswordFormFactory, 
  PhoneAuthenticatorFormFactory, 
  UserProfileFormFactory, 
  VerifyEmailFormFactory, 
  VerifySmsFormFactory,
  VerifyPasscodeFormFactory,
  OktaVerifyAuthenticatorFormFactory,
  OktaVerifyAuthenticatorEnollmentChannelFormFactory,
  WebauthnAuthenticatorFormFactory,
} from './forms';
import {
  UsernameValueFactory,
  PasswordValueFactory,
  AuthenticatorValueFactory,
  CredentialsValueFactory,
  IdxValueFactory,
  NewPasswordValueFactory,
  EmailValueFactory,
  PhoneNumberValueFactory,
  StateHandleValueFactory
} from './values';

interface MockedIdxRemediation extends IdxRemediation {
  _authenticator?: IdxAuthenticator;
  _form?: IdxForm;
  [key: string]: any;
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

export const SelectIdentifyRemediationFactory = IdxRemediationFactory.params({
  name: 'select-identify'
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

export const VerifyPhoneRemediationFactory = ChallengeAuthenticatorRemediationFactory.params({
  name: 'challenge-authenticator',
  value: [
    CredentialsValueFactory.build({
      form: VerifySmsFormFactory.build()
    })
  ],
  relatesTo: {
    value: PhoneAuthenticatorFactory.build()
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

export const VerifySecurityQuestionAuthenticatorRemediationFactory = ChallengeAuthenticatorRemediationFactory.params({
  name: 'challenge-authenticator',
  value: [
    CredentialsValueFactory.build({
      form: VerifyPasscodeFormFactory.build()
    })
  ],
  relatesTo: {
    value: SecurityQuestionAuthenticatorFactory.build({
      contextualData: {
        enrolledQuestion: {
          questionKey: 'favorite_sports_player',
          question: 'Who is your favorite sports player?'
        }
      }
    })
  }
});

export const VerifyOktaVerifyAuthenticatorRemediationFactory = ChallengeAuthenticatorRemediationFactory.params({
  name: 'challenge-authenticator',
  value: [
    CredentialsValueFactory.build({
      form: VerifyPasscodeFormFactory.build()
    })
  ],
  relatesTo: {
    value: OktaVerifyAuthenticatorFactory.build()
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

export const ResetAuthenticatorRemediationFactory = IdxRemediationFactory.params({
  name: 'reset-authenticator',
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

export const VerifyWebauthnAuthenticatorRemediationFactory = ChallengeAuthenticatorRemediationFactory.params({
  name: 'challenge-authenticator',
  value: [
    CredentialsValueFactory.build({
      form: WebauthnAuthenticatorFormFactory.build()
    })
  ],
  relatesTo: {
    type: 'object',
    value: WebauthnAuthenticatorFactory.build({
      contextualData: {
        challengeData: {
          challenge: 'CHALLENGE',
          userVerification: 'preferred'
        }
      }
    })
  }
});

export const EnrollWebauthnAuthenticatorRemediationFactory = EnrollAuthenticatorRemediationFactory.params({
  relatesTo: {
    type: 'object',
    value: WebauthnAuthenticatorFactory.build({
      contextualData: {
        activationData: {
          rp: {
            name: 'Javascript IDX SDK Test Org'
          },
          user: {
            id: '000000001',
            name: 'mary@acme.com',
            displayName: 'Mary'
          },
          pubKeyCredParams: [{
            type: 'public-key',
            alg: -7
          }, {
            type: 'public-key',
            alg: -257
          }],
          challenge: 'CHALLENGE',
          attestation: 'direct',
          authenticatorSelection: {
            userVerification: 'discouraged',
            requireResidentKey: false,
          }
        }
      }
    })
  },
  value: [
    CredentialsValueFactory.build({
      form: WebauthnAuthenticatorFormFactory.build()
    })
  ]
});

export const EnrollSecurityQuestionAuthenticatorRemediationFactory = EnrollAuthenticatorRemediationFactory.params({
  relatesTo: {
    type: 'object',
    value: SecurityQuestionAuthenticatorFactory.build({
      contextualData: {
        questions: [
          {
            questionKey: 'disliked_food', 
            question: 'What is the food you least liked as a child?'
          },
          {
            questionKey: 'name_of_first_plush_toy', 
            question: 'What is the name of your first stuffed animal?'
          },
          {
            questionKey: 'first_award', 
            question: 'What did you earn your first medal or award for?'
          }
        ],
        questionKeys: [
          'disliked_food',
          'name_of_first_plush_toy',
          'first_award'
        ]
      }
    })
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

export const EnrollProfileWithPasswordRemediationFactory = IdxRemediationFactory.params({
  name: 'enroll-profile',
  value: [
    IdxValueFactory.build({
      name: 'userProfile',
      form: UserProfileFormFactory.build()
    }),
    CredentialsValueFactory.build({
      form: PasswordFormFactory.build()
    })
  ],
  relatesTo: {
    type: 'object',
    value: PasswordAuthenticatorFactory.build()
  },
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

export const EmailAuthenticatorVerificationDataRemediationFactory = AuthenticatorVerificationDataRemediationFactory.params({
  relatesTo: {
    type: 'object',
    value: EmailAuthenticatorFactory.build()
  },
  value: [
    AuthenticatorValueFactory.build({
      label: 'Email',
      form: EmailAuthenticatorFormFactory.build()
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

export const OktaVerifyAuthenticatorVerificationDataRemediationFactory = AuthenticatorVerificationDataRemediationFactory.params({
  relatesTo: {
    type: 'object',
    value: OktaVerifyAuthenticatorFactory.build()
  },
  value: [
    AuthenticatorValueFactory.build({
      label: 'Okta Verify',
      form: OktaVerifyAuthenticatorFormFactory.build()
    }),
  ]
});

export const RedirectIdpRemediationFactory = IdxRemediationFactory.params({
  name: 'redirect-idp',
});

export const SkipRemediationFactory = IdxRemediationFactory.params({
  name: 'skip'
});

export const EnrollPollRemediationFactory = IdxRemediationFactory.params({
  name: 'enroll-poll',
  refresh: 100
});

export const ChallengePollRemediationFactory = EnrollPollRemediationFactory.params({
  name: 'challenge-poll'
});

export const SelectEnrollmentChannelRemediationFactory = IdxRemediationFactory.params({
  name: 'select-enrollment-channel',
  value: [
    AuthenticatorValueFactory.build({
      label: 'Okta Verify',
      value: OktaVerifyAuthenticatorEnollmentChannelFormFactory.build()
    }),
  ]
});

export const EnrollmentChannelDataEmailRemediationFactory = IdxRemediationFactory.params({
  name: 'enrollment-channel-data',
  value: [
    EmailValueFactory.build()
  ]
});

export const EnrollmentChannelDataSmsRemediationFactory = IdxRemediationFactory.params({
  name: 'enrollment-channel-data',
  value: [
    PhoneNumberValueFactory.build()
  ]
});

export const OktaVerifyPushChallengePollRemediationFactory = ChallengePollRemediationFactory.params({
  name: 'challenge-poll',
  relatesTo: {
    type: 'object',
    value: OktaVerifyPushOnlyAuthenticatorFactory.build()
  },
  value: [],
  refresh: 4000
});

export const UnlockAccountRemediationFactory = IdxRemediationFactory.params({
  name: 'unlock-account'
});

export const SelectAuthenticatorUnlockAccountRemediationFactory = IdxRemediationFactory.params({
  name: 'select-authenticator-unlock-account',
  value: [
    UsernameValueFactory.build(),
    AuthenticatorValueFactory.build()
  ]
});

export const ResendAuthenticatorFactory = IdxRemediationFactory.params({
  accepts: 'application/json; okta-version=1.0.0',
  href: 'http://localhost:3000/idp/idx/challenge/resend',
  method: 'POST',
  name: 'resend',
  produces: 'application/ion+json; okta-version=1.0.0',
  rel: ['create-form'],
  value: [
    StateHandleValueFactory.build()
  ]
});