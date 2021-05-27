import { Factory } from 'fishery';
import { IdxRemediation, IdxAuthenticator, IdxForm } from '../../../../lib/idx/types/idx-js';
import {
  EmailAuthenticatorFactory,
  PasswordAuthenticatorFactory,
  PhoneAuthenticatorFactory
} from './authenticators';
import { EmailAuthenticatorFormFactory, PasswordFormFactory, PhoneAuthenticatorFormFactory, UserProfileFormFactory, VerifyEmailFormFactory, VerifySmsFormFactory } from './forms';

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

export const EnrollProfileRemediationFactory = IdxRemediationFactory.params({
  name: 'enroll-profile',
  value: [
    IdxValueFactory.build({
      name: 'userProfile',
      form: UserProfileFormFactory.build()
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
