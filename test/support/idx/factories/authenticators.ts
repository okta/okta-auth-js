import { Factory } from 'fishery';
import { IdxAuthenticator } from '../../../../lib/idx/types/idx-js';
import {
  PasswordAuthenticatorMethodFactory,
  PushAuthenticatorMethodFactory,
  TotpAuthenticatorMethodFactory,
  SmsAuthenticatorMethodFactory,
  VoiceAuthenticatorMethodFactory,
  EmailAuthenticatorMethodFactory
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
  key: 'okta_verify',
  type: 'app',
  methods: [
    PushAuthenticatorMethodFactory.build(),
    TotpAuthenticatorMethodFactory.build()
  ]
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
