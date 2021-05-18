import { Factory } from 'fishery';
import { IdxAuthenticatorMethod } from '../../../lib/idx/types';

export const IdxAuthenticatorMethodFactory = Factory.define<IdxAuthenticatorMethod>(() => {
  return {
    type: 'unknown-method'
  };
});

export const PasswordAuthenticatorMethodFactory = IdxAuthenticatorMethodFactory.params({
  type: 'password'
});

export const PushAuthenticatorMethodFactory = IdxAuthenticatorMethodFactory.params({
  type: 'push'
});

export const TotpAuthenticatorMethodFactory = IdxAuthenticatorMethodFactory.params({
  type: 'totp'
});

export const SmsAuthenticatorMethodFactory = IdxAuthenticatorMethodFactory.params({
  type: 'sms'
});

export const VoiceAuthenticatorMethodFactory = IdxAuthenticatorMethodFactory.params({
  type: 'voice'
});

export const EmailAuthenticatorMethodFactory = IdxAuthenticatorMethodFactory.params({
  type: 'email'
});
