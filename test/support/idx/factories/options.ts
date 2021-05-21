import { Factory } from 'fishery';
import { IdxOption, IdxAuthenticator } from '../../../../lib/idx/types/idx-js';
import {
  EmailAuthenticatorFactory,
  OktaVerifyAuthenticatorFactory,
  PasswordAuthenticatorFactory,
  PhoneAuthenticatorFactory
} from './authenticators';
import { IdxFormFactory, PhoneAuthenticatorFormFactory, EmailAuthenticatorFormFactory } from './forms';

interface MockedIdxOption extends IdxOption {
  _authenticator?: IdxAuthenticator;
}

export const IdxOptionFactory = Factory.define<MockedIdxOption>(() => {
  return {
    label: 'unknown-option',
    value: ''
  };
});

export const AuthenticatorOptionFactory = IdxOptionFactory.afterBuild(res => {
  if (!res._authenticator) {
    throw new Error('AuthenticatorOptionFactory requires "_authenticator" passed in params');
  }
  if (res.relatesTo) {
    throw new Error('Do not set "relatesTo" on params for AuthenticatorOptionFactory');
  }

  res.label = res._authenticator.displayName;
  res.relatesTo = res._authenticator;

  if (!res.value) {
    res.value = {
      form: IdxFormFactory.build()
    };
  }
});

export const PasswordAuthenticatorOptionFactory = AuthenticatorOptionFactory.params({
  _authenticator: PasswordAuthenticatorFactory.build()
});

export const OktaVerifyAuthenticatorOptionFactory = AuthenticatorOptionFactory.params({
  _authenticator: OktaVerifyAuthenticatorFactory.build()
});


export const PhoneAuthenticatorOptionFactory = AuthenticatorOptionFactory.params({
  _authenticator: PhoneAuthenticatorFactory.build(),
  value: {
    form: PhoneAuthenticatorFormFactory.build()
  }
});

export const EmailAuthenticatorOptionFactory = AuthenticatorOptionFactory.params({
  _authenticator: EmailAuthenticatorFactory.build(),
  value: {
    form: EmailAuthenticatorFormFactory.build()
  }
});
