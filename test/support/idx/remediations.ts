import { Factory } from 'fishery';
import { IdxRemediation, IdxAuthenticator } from '../../../lib/idx/types';
import {
  EmailAuthenticatorFactory,
  OktaVerifyAuthenticatorFactory,
  PasswordAuthenticatorFactory,
  PhoneAuthenticatorFactory
} from './authenticators';
import {
  UsernameValueFactory,
  PasswordValueFactory,
  AuthenticatorValueFactory,
  IdValueFactory,
  PhoneMethodTypeValueFactory,
  PhoneNumberValueFactory
} from './values';

interface MockedIdxRemediation extends IdxRemediation {
  _testSeq: number;
  _authenticator?: IdxAuthenticator;
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

export const IdentifyWithPasswordRemediationFactory = IdentifyRemediationFactory.afterBuild((res) => {
  res.value.push(PasswordValueFactory.build());
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

export const AuthenticatorRemediationFactory = IdxRemediationFactory.afterBuild(res => {
  if (!res._authenticator) {
    throw new Error('AuthenticatorRemediationFactory requires "_authenticator" passed in params');
  }
  if (res.relatesTo) {
    throw new Error('Do not set "relatesTo" on params for AuthenticatorRemediationFactory');
  }

  res.label = res._authenticator.displayName;
  res.relatesTo = {
    type: 'object',
    value: res._authenticator
  };
});

export const PasswordAuthenticatorRemediationFactory = AuthenticatorRemediationFactory.params({
  _authenticator: PasswordAuthenticatorFactory.build()
});

export const OktaVerifyAuthenticatorRemediationFactory = AuthenticatorRemediationFactory.params({
  _authenticator: OktaVerifyAuthenticatorFactory.build()
});


export const PhoneAuthenticatorRemediationFactory = AuthenticatorRemediationFactory.params({
  _authenticator: PhoneAuthenticatorFactory.build()
});

export const EmailAuthenticatorRemediationFactory = AuthenticatorRemediationFactory.params({
  _authenticator: EmailAuthenticatorFactory.build()
});

export const SelectAuthenticatorRemediationFactory = IdxRemediationFactory.params({
  name: 'select-authenticator-authenticate',
  value: [
    AuthenticatorValueFactory.build({
      options: [
        PasswordAuthenticatorRemediationFactory.build(),
        OktaVerifyAuthenticatorRemediationFactory.build(),
        PhoneAuthenticatorRemediationFactory.build(),
        EmailAuthenticatorRemediationFactory.build()
      ]
    })
  ]
});

export const EnrollAuthenticatorRemediationFactory = AuthenticatorRemediationFactory.params({
  name: 'authenticator-enrollment-data'
});

export const EnrollPhoneAuthenticatorRemediationFactory = EnrollAuthenticatorRemediationFactory.params({
  _authenticator: PhoneAuthenticatorFactory.build(),
}).afterBuild(res => {
  res.value =[
    AuthenticatorValueFactory.build({
      label: res._authenticator.displayName,
      form: {
        value: [
          IdValueFactory.build(),
          PhoneMethodTypeValueFactory.build(),
          PhoneNumberValueFactory.build()
        ]
      }
    })
  ];
});

export const RecoverPasswordRemediationFactory = IdxRemediationFactory.params({
  name: 'recover'
});
