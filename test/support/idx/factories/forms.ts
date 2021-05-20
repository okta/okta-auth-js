import { Factory } from 'fishery';
import { IdxForm } from '../../../../lib/idx/types/idx-js';

import {
  IdxValueFactory,
  IdValueFactory,
  PhoneMethodTypeValueFactory,
  PhoneNumberValueFactory
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