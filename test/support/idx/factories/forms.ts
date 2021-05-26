import { Factory } from 'fishery';
import { IdxForm } from '../../../../lib/idx/types/idx-js';

import {
  IdxValueFactory,
  IdValueFactory,
  PhoneMethodTypeValueFactory,
  PhoneNumberValueFactory,
  FirstNameValueFactory,
  LastNameValueFactory,
  EmailValueFactory
} from './values';

export const IdxFormFactory = Factory.define<IdxForm>(() => {
  return {
    value: [
      // IdValueFactory.build()
    ]
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
    IdxValueFactory.build({
      label: 'Enter code',
      name: 'passcode'
    })
  ]
});

export const UserProfileFormFactory = IdxFormFactory.params({
  value: [
    FirstNameValueFactory.build(),
    LastNameValueFactory.build(),
    EmailValueFactory.build()
  ]
});
