import { Factory } from 'fishery';
import { IdxRemediation, IdxAuthenticator, IdxForm } from '../../../../lib/idx/types/idx-js';
import {
  PasswordAuthenticatorFactory,
  PhoneAuthenticatorFactory
} from './authenticators';
import { PhoneAuthenticatorFormFactory, VerifySmsFormFactory } from './forms';
import {
  EmailAuthenticatorOptionFactory,
  OktaVerifyAuthenticatorOptionFactory,
  PhoneAuthenticatorOptionFactory
} from './options';
import {
  UsernameValueFactory,
  PasswordValueFactory,
  AuthenticatorValueFactory,
  CredentialsValueFactory,
} from './values';

interface MockedIdxRemediation extends IdxRemediation {
  _testSeq: number;
  _authenticator?: IdxAuthenticator;
  _form?: IdxForm;
}

export const IdxRemediationFactory = Factory.define<MockedIdxRemediation>(({
  sequence
}) => {
  return {
    _testSeq: sequence,
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

export const VerifyPasswordRemediationFactory = IdentifyRemediationFactory.params({
  name: 'challenge-authenticator',
  value: [
    PasswordValueFactory.build()
  ],
  relatesTo: {
    value: PasswordAuthenticatorFactory.build()
  }
});

export const SelectAuthenticatorRemediationFactory = IdxRemediationFactory.params({
  name: 'select-authenticator-authenticate',
  value: [
    AuthenticatorValueFactory.build({
      options: [
        OktaVerifyAuthenticatorOptionFactory.build(),
        PhoneAuthenticatorOptionFactory.build(),
        EmailAuthenticatorOptionFactory.build()
      ]
    })
  ]
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

